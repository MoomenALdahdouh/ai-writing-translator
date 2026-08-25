import {
  captureSnapshot,
  isValueEditable,
  readFieldText,
  readSelectionRange,
  snapshotGeneration,
  type EditableElement,
  type ReplacementSnapshot,
} from '../dom/index.ts'
import type { TranslateCurrentTextResult } from '../messaging.ts'
import type { LanguageCode } from '../languages.ts'
import { resolveTranslateTarget, targetLooksProtected } from '../translation/context.ts'
import { isStaleTicket } from '../translation/stale.ts'
import type { TranslationTicket } from '../translation/types.ts'

export type TranslateHost = {
  shortcutEnabled: boolean
  composing: boolean
  pageBlocked: boolean
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  preferredElement?: EditableElement | null
  fieldBlocked: (element: Element) => boolean
  usageAllowed: () => Promise<boolean>
  requestTranslation: (
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode,
  ) => Promise<string | null>
  writeFix: (snapshot: ReplacementSnapshot, translation: string) => boolean
}

export function getFocusedEditable(root: Document = document): EditableElement | null {
  let node: Element | null = root.activeElement
  while (node) {
    const editable = closestEditable(node)
    if (editable) return editable
    node = node.shadowRoot?.activeElement ?? null
  }
  return null
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

export async function translateCurrentText(
  host: TranslateHost,
): Promise<TranslateCurrentTextResult> {
  if (!host.shortcutEnabled) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'disabled' }
  }
  if (host.composing) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'composing' }
  }
  if (host.pageBlocked) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'blocked' }
  }
  if (host.sourceLanguage === host.targetLanguage) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'noop' }
  }

  const focused = getFocusedEditable()
  const element =
    focused && !host.fieldBlocked(focused)
      ? focused
      : host.preferredElement &&
          host.preferredElement.isConnected &&
          !host.fieldBlocked(host.preferredElement)
        ? host.preferredElement
        : null
  if (!element) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'unsupported' }
  }

  if (!(await host.usageAllowed())) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'usage' }
  }

  const text = readFieldText(element)
  const selection = readSelectionRange(element)
  if (!selection) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'no-target' }
  }
  const target = resolveTranslateTarget(text, selection.start, selection.end)
  if (!target) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'no-target' }
  }
  if (targetLooksProtected(target.text)) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'protected' }
  }

  const ticket: TranslationTicket = {
    id: Date.now(),
    elementGeneration: snapshotGeneration(element),
    originalText: target.text,
    start: target.start,
    end: target.end,
    sourceLanguage: host.sourceLanguage,
    targetLanguage: host.targetLanguage,
    mode: 'shortcut',
  }

  const translation = await host.requestTranslation(
    target.text,
    host.sourceLanguage,
    host.targetLanguage,
  )
  if (!translation || translation === target.text) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'failed' }
  }

  const liveText = readFieldText(element)
  if (
    isStaleTicket(ticket, {
      generation: snapshotGeneration(element),
      text: liveText,
      start: ticket.start,
      end: ticket.end,
      sourceLanguage: host.sourceLanguage,
      targetLanguage: host.targetLanguage,
    })
  ) {
    return { type: 'TRANSLATE_CURRENT_TEXT_RESULT', applied: false, reason: 'stale' }
  }

  const snapshot = captureSnapshot(
    element,
    isValueEditable(element) ? 'value' : 'contenteditable',
    target.text,
    target.start,
    target.end,
    target.end,
  )
  const applied = host.writeFix(snapshot, translation)
  return {
    type: 'TRANSLATE_CURRENT_TEXT_RESULT',
    applied,
    reason: applied ? undefined : 'stale',
  }
}
