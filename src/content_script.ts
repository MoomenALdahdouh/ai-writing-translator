import { PAGE_MARKER } from './brand.ts'
import { evaluateGate } from './content/evaluateGate.ts'
import { translateCurrentText } from './content/translateCurrentText.ts'
import {
  ACTIVITY_HEARTBEAT_MS,
  USAGE_STORAGE_KEY,
} from './entitlement/index.ts'
import type {
  InterveneDecisionResult,
  TranslateCurrentTextResult,
  TranslateTextError,
  TranslateTextResult,
} from './messaging.ts'
import {
  hydrateProfile,
  isLiveEnabled,
  isProductActive,
  isShortcutEnabled,
  PROFILE_STORAGE_KEY,
  type UserProfile,
} from './profile/index.ts'
import {
  beginComposition,
  bumpGeneration,
  captureSnapshot,
  commitReplacement,
  endComposition,
  isComposing,
  isValueEditable,
  readCaret,
  readFieldText,
  snapshotGeneration,
} from './dom/index.ts'
import type { EditableElement, ReplacementSnapshot } from './dom/index.ts'
import { isContextInvalidated, isExtensionAlive } from './runtime.ts'
import {
  MAX_FIELD_CHARS,
  isExcludedHost,
  isInsideMarkdownCode,
  probeElement,
  skipReasonForField,
} from './safety/index.ts'
import { liveSegmentOnPause } from './translation/segments.ts'
import { targetLooksProtected } from './translation/context.ts'
import { isStaleTicket } from './translation/stale.ts'
import type { LanguageCode } from './languages.ts'
import type { TranslationTicket } from './translation/types.ts'

document.documentElement.dataset[PAGE_MARKER] = 'active'

let enabled = true
let pausedUntil = 0
let shortcutEnabled = true
let liveEnabled = false
let canIntervene = true
let lastActivitySentAt = 0
let sourceLanguage: LanguageCode = 'ar'
let targetLanguage: LanguageCode = 'en'
let excludedDomains: string[] = []
let liveTimer: number | null = null
let liveTicketId = 0
let lastFocused: EditableElement | null = null
const LIVE_PAUSE_MS = 750

function applyUserProfile(next: UserProfile): void {
  enabled = next.enabled
  pausedUntil = next.pausedUntil
  shortcutEnabled = next.shortcutEnabled !== false
  liveEnabled = next.liveEnabled === true
  sourceLanguage = next.sourceLanguage
  targetLanguage = next.targetLanguage
  excludedDomains = next.excludedDomains
}

function productOn(): boolean {
  return isProductActive({ enabled, pausedUntil })
}

function pageBlocked(): boolean {
  try {
    return isExcludedHost(location.hostname, excludedDomains)
  } catch {
    return true
  }
}

function fieldBlocked(element: Element): boolean {
  return skipReasonForField(probeElement(element)) !== null
}

function closestEditable(start: Element): EditableElement | null {
  let node: Element | null = start
  while (node) {
    if (isValueEditable(node)) return node
    if (node instanceof HTMLElement && node.isContentEditable) return node
    node = node.parentElement
  }
  return null
}

function getEditableTarget(event: Event): EditableElement | null {
  const raw = event.target
  if (!(raw instanceof Element)) return null
  return closestEditable(raw)
}

function rememberFocus(element: EditableElement | null): void {
  if (!element || fieldBlocked(element)) return
  lastFocused = element
}

function readStoredIntervention(raw: unknown): void {
  if (!raw || typeof raw !== 'object') return
  if ('canIntervene' in raw) {
    canIntervene = (raw as { canIntervene?: boolean }).canIntervene !== false
  }
}

function noteActivity(element: EditableElement | null): void {
  if (!element || !productOn() || !isExtensionAlive()) return
  if (pageBlocked() || fieldBlocked(element)) return
  const now = Date.now()
  if (now - lastActivitySentAt < ACTIVITY_HEARTBEAT_MS) return
  lastActivitySentAt = now
  void chrome.runtime
    .sendMessage({ type: 'NOTE_USAGE_ACTIVITY' })
    .then((response) => {
      const result = response as InterveneDecisionResult | undefined
      if (result?.type === 'INTERVENE_DECISION') canIntervene = result.canIntervene
    })
    .catch(() => {
      /* fail closed on the next check */
    })
}

async function refreshUsageAllowed(): Promise<boolean> {
  if (!isExtensionAlive()) return false
  try {
    const response = (await chrome.runtime.sendMessage({
      type: 'CAN_INTERVENE',
    })) as InterveneDecisionResult | undefined
    if (response?.type === 'INTERVENE_DECISION') {
      canIntervene = response.canIntervene
      return response.decision === 'ALLOW'
    }
  } catch {
    return false
  }
  return canIntervene
}

function writeTranslation(snapshot: ReplacementSnapshot, translation: string): boolean {
  return (
    commitReplacement(snapshot, translation, true, snapshot.element, {
      allowActiveEdit: true,
      placeCaretAfter: true,
    }) === 'written'
  )
}

async function requestTranslation(
  text: string,
  source: LanguageCode,
  target: LanguageCode,
  mode: 'shortcut' | 'live',
): Promise<string | null> {
  if (!isExtensionAlive()) return null
  try {
    const response = (await chrome.runtime.sendMessage({
      type: 'TRANSLATE_TEXT',
      sourceLanguage: source,
      targetLanguage: target,
      text,
      mode,
    })) as TranslateTextResult | TranslateTextError | undefined
    if (response?.type === 'TRANSLATE_TEXT_RESULT' && response.ok) {
      return response.translation
    }
  } catch (error) {
    if (isContextInvalidated(error)) return null
  }
  return null
}

function keepServiceWorkerAlive(): void {
  if (!isExtensionAlive()) return
  try {
    chrome.runtime.connect({ name: 'keepalive' })
  } catch {
    /* ignore */
  }
}

async function handleTranslateCurrentText(): Promise<TranslateCurrentTextResult> {
  return translateCurrentText({
    shortcutEnabled: isShortcutEnabled({ shortcutEnabled }) && productOn(),
    composing: isComposing(),
    pageBlocked: pageBlocked(),
    sourceLanguage,
    targetLanguage,
    fieldBlocked,
    preferredElement: lastFocused,
    usageAllowed: refreshUsageAllowed,
    requestTranslation: (text, source, target) =>
      requestTranslation(text, source, target, 'shortcut'),
    writeFix: writeTranslation,
  })
}

function scheduleLiveTranslation(element: EditableElement): void {
  if (liveTimer !== null) window.clearTimeout(liveTimer)
  liveTimer = window.setTimeout(() => {
    liveTimer = null
    void runLiveTranslation(element)
  }, LIVE_PAUSE_MS)
}

function runLiveTranslation(element: EditableElement): void {
  const gate = evaluateGate({
    live: productOn() && isLiveEnabled({ liveEnabled }),
    composing: isComposing(),
    pageBlocked: pageBlocked(),
    canIntervene,
  })
  if (gate === 'skip') return
  if (fieldBlocked(element)) return
  if (sourceLanguage === targetLanguage) return

  const text = readFieldText(element)
  if (text.length > MAX_FIELD_CHARS) return
  const caret = readCaret(element) ?? text.length
  const segment = liveSegmentOnPause(text, caret)
  if (!segment) return
  if (targetLooksProtected(segment.text)) return
  if (isInsideMarkdownCode(text, segment.start)) return

  const ticket: TranslationTicket = {
    id: (liveTicketId += 1),
    elementGeneration: snapshotGeneration(element),
    originalText: segment.text,
    start: segment.start,
    end: segment.end,
    sourceLanguage,
    targetLanguage,
    mode: 'live',
  }

  if (gate === 'await-usage') {
    void refreshUsageAllowed().then((ok) => {
      if (ok) void applyLiveResult(element, ticket)
    })
    return
  }
  void applyLiveResult(element, ticket)
}

async function applyLiveResult(
  element: EditableElement,
  ticket: TranslationTicket,
): Promise<void> {
  const translation = await requestTranslation(
    ticket.originalText,
    ticket.sourceLanguage,
    ticket.targetLanguage,
    'live',
  )
  if (!translation || translation === ticket.originalText) return
  if (!element.isConnected) return
  const liveText = readFieldText(element)
  if (
    isStaleTicket(ticket, {
      generation: snapshotGeneration(element),
      text: liveText,
      start: ticket.start,
      end: ticket.end,
      sourceLanguage,
      targetLanguage,
    })
  ) {
    return
  }
  const snapshot = captureSnapshot(
    element,
    isValueEditable(element) ? 'value' : 'contenteditable',
    ticket.originalText,
    ticket.start,
    ticket.end,
    ticket.end,
  )
  writeTranslation(snapshot, translation)
}

document.addEventListener('compositionstart', () => {
  beginComposition()
})
document.addEventListener('compositionend', (event) => {
  endComposition()
  const element = getEditableTarget(event)
  if (element && productOn() && isLiveEnabled({ liveEnabled })) {
    scheduleLiveTranslation(element)
  }
})

document.addEventListener(
  'focusin',
  (event) => {
    rememberFocus(getEditableTarget(event))
  },
  true,
)

document.addEventListener(
  'keydown',
  (event) => {
    const element = getEditableTarget(event)
    if (element) noteActivity(element)
    if (event.key === 'Enter' && element && productOn() && isLiveEnabled({ liveEnabled })) {
      scheduleLiveTranslation(element)
    }
  },
  true,
)

document.addEventListener(
  'input',
  (event) => {
    const element = getEditableTarget(event)
    if (!element) return
    rememberFocus(element)
    bumpGeneration(element, (event as InputEvent).inputType)
    noteActivity(element)
    if (!productOn() || !isLiveEnabled({ liveEnabled })) return
    if (isComposing() || pageBlocked() || fieldBlocked(element)) return
    scheduleLiveTranslation(element)
  },
  true,
)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'TRANSLATE_CURRENT_TEXT') return
  void handleTranslateCurrentText().then(sendResponse)
  return true
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[PROFILE_STORAGE_KEY]) {
    applyUserProfile(hydrateProfile(changes[PROFILE_STORAGE_KEY].newValue).profile)
  }
  if (area === 'local' && changes[USAGE_STORAGE_KEY]) {
    readStoredIntervention(changes[USAGE_STORAGE_KEY].newValue)
  }
})

void chrome.storage.local
  .get({ [PROFILE_STORAGE_KEY]: null, [USAGE_STORAGE_KEY]: null })
  .then((stored) => {
    applyUserProfile(hydrateProfile(stored[PROFILE_STORAGE_KEY]).profile)
    readStoredIntervention(stored[USAGE_STORAGE_KEY])
  })

keepServiceWorkerAlive()
setInterval(keepServiceWorkerAlive, 20_000)
