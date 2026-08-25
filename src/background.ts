import { DEFAULT_API_BASE_URL } from './brand.ts'
import {
  isTranslateCommand,
  readAssignedShortcut,
  sendTranslateToActiveTab,
} from './background/commands.ts'
import {
  createChromeEntitlementStore,
  createEntitlementEngine,
  LICENSE_KEY_STORAGE_KEY,
} from './entitlement/index.ts'
import { SUPPORTED_LANGUAGES } from './languages.ts'
import type {
  ActivateLicenseRequest,
  ActivateLicenseResult,
  ExtensionRequest,
  ExtensionStatus,
  InterveneDecisionResult,
  TranslateTextError,
  TranslateTextRequest,
  TranslateTextResult,
} from './messaging.ts'
import {
  hydrateProfile,
  PROFILE_STORAGE_KEY,
  TEMPORARY_PAUSE_MS,
  type UserProfile,
} from './profile/index.ts'
import {
  normalizeUserProfile,
  withLanguages,
  withSwappedLanguages,
} from './profile/normalize.ts'
import {
  addExcludedDomain,
  buildTranslatePayload,
  normalizeExcludedDomains,
  removeExcludedDomain,
} from './safety/index.ts'
import { canTranslateRequest } from './translation/engine.ts'
import { createMemoryTranslationCache, translationCacheKey } from './translation/cache.ts'
import type { TranslationFailureCode } from './translation/types.ts'

const API_BASE_URL = DEFAULT_API_BASE_URL
const entitlement = createEntitlementEngine({
  store: createChromeEntitlementStore(),
  isOnline: () => apiOnline,
})
const memoryCache = createMemoryTranslationCache()
let cachedProfile: UserProfile | null = null
let cachedLicenseKey: string | null = null
let apiOnline = false
let lastTranslateError = ''

async function getLicenseKey(): Promise<string> {
  if (cachedLicenseKey !== null) return cachedLicenseKey
  const stored = await chrome.storage.sync.get({ [LICENSE_KEY_STORAGE_KEY]: '' })
  cachedLicenseKey = String(stored[LICENSE_KEY_STORAGE_KEY] ?? '')
  return cachedLicenseKey
}

async function loadUserProfile(): Promise<UserProfile> {
  if (cachedProfile) return cachedProfile
  const local = await chrome.storage.local.get({ [PROFILE_STORAGE_KEY]: null })
  const hydrated = hydrateProfile(local[PROFILE_STORAGE_KEY])
  cachedProfile = hydrated.profile
  if (hydrated.recovered) {
    await chrome.storage.local.set({ [PROFILE_STORAGE_KEY]: cachedProfile })
  }
  return cachedProfile
}

async function saveProfile(next: UserProfile): Promise<UserProfile> {
  const profile = normalizeUserProfile(next)
  cachedProfile = profile
  await chrome.storage.local.set({ [PROFILE_STORAGE_KEY]: profile })
  return profile
}

async function probeApi(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' })
    apiOnline = response.ok
  } catch {
    apiOnline = false
  }
  return apiOnline
}

function mapHttpFailure(status: number): TranslationFailureCode {
  if (status === 403 || status === 503) return 'license'
  if (status === 429) return 'rate-limited'
  if (status === 0) return 'network'
  return 'upstream'
}

async function translateViaApi(
  request: TranslateTextRequest,
): Promise<TranslateTextResult | TranslateTextError> {
  const blocked = canTranslateRequest({
    sourceLanguage: request.sourceLanguage,
    targetLanguage: request.targetLanguage,
    text: request.text,
    mode: request.mode,
  })
  if (blocked && !blocked.ok) {
    lastTranslateError = blocked.code
    return { type: 'TRANSLATE_TEXT_ERROR', ok: false, code: blocked.code }
  }

  const cacheKey = translationCacheKey(
    request.sourceLanguage,
    request.targetLanguage,
    request.text,
  )
  const cached = memoryCache.get(cacheKey)
  if (cached) {
    return {
      type: 'TRANSLATE_TEXT_RESULT',
      ok: true,
      translation: cached,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
    }
  }

  const licenseKey = await getLicenseKey()
  const payload = buildTranslatePayload({
    license_key: licenseKey || undefined,
    source_language: request.sourceLanguage,
    target_language: request.targetLanguage,
    text: request.text,
    context: { mode: request.mode },
  })

  try {
    const response = await fetch(`${API_BASE_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const code = mapHttpFailure(response.status)
      lastTranslateError =
        response.status === 502
          ? 'Groq rejected the model call. Check TRANSLATION_MODEL in backend/.env.'
          : code
      return {
        type: 'TRANSLATE_TEXT_ERROR',
        ok: false,
        code,
      }
    }
    const body = (await response.json()) as {
      translation?: unknown
      source_language?: unknown
      target_language?: unknown
    }
    if (typeof body.translation !== 'string' || !body.translation.trim()) {
      return { type: 'TRANSLATE_TEXT_ERROR', ok: false, code: 'invalid-response' }
    }
    memoryCache.set(cacheKey, body.translation)
    lastTranslateError = ''
    return {
      type: 'TRANSLATE_TEXT_RESULT',
      ok: true,
      translation: body.translation,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
    }
  } catch {
    lastTranslateError = 'Cannot reach the local API.'
    return { type: 'TRANSLATE_TEXT_ERROR', ok: false, code: 'network' }
  }
}

async function handleStatus(): Promise<ExtensionStatus> {
  const [profile, licenseKey, view, commands] = await Promise.all([
    loadUserProfile(),
    getLicenseKey(),
    entitlement.snapshot(),
    chrome.commands.getAll(),
  ])
  await probeApi()
  return {
    type: 'STATUS',
    enabled: profile.enabled,
    shortcutEnabled: profile.shortcutEnabled,
    liveEnabled: profile.liveEnabled,
    commandShortcut: readAssignedShortcut(commands),
    licenseKey,
    licenseRequired: false,
    apiBaseUrl: API_BASE_URL,
    apiReachable: apiOnline,
    lastError: lastTranslateError,
    sourceLanguage: profile.sourceLanguage,
    targetLanguage: profile.targetLanguage,
    excludedDomains: profile.excludedDomains,
    pausedUntil: profile.pausedUntil,
    languages: SUPPORTED_LANGUAGES.map((item) => ({
      code: item.code,
      name: item.name,
      native: item.native,
    })),
    entitlement: view,
  }
}

async function handleActivate(request: ActivateLicenseRequest): Promise<ActivateLicenseResult> {
  const key = request.licenseKey.trim()
  if (!key) {
    return { type: 'ACTIVATE_LICENSE_RESULT', ok: false, licenseRequired: true, status: 'empty' }
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/license/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: key, product_id: 'LINGO' }),
    })
    const body = (await response.json()) as {
      valid?: boolean
      status?: string
      license_required?: boolean
    }
    const ok = response.ok && body.valid === true
    if (ok) {
      cachedLicenseKey = key
      await chrome.storage.sync.set({ [LICENSE_KEY_STORAGE_KEY]: key })
      await entitlement.rememberLicense(true, body.status ?? 'active')
    } else {
      await entitlement.rememberLicense(false, body.status ?? 'invalid')
    }
    return {
      type: 'ACTIVATE_LICENSE_RESULT',
      ok,
      licenseRequired: body.license_required !== false,
      status: body.status ?? (ok ? 'active' : 'invalid'),
      error: ok ? undefined : response.ok ? 'invalid' : 'network',
    }
  } catch {
    return {
      type: 'ACTIVATE_LICENSE_RESULT',
      ok: false,
      licenseRequired: true,
      status: 'network',
      error: 'network',
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void entitlement.ensureActivated()
  void loadUserProfile()
})

chrome.runtime.onStartup.addListener(() => {
  void entitlement.ensureActivated()
})

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'keepalive') return
})

chrome.commands.onCommand.addListener((command) => {
  if (!isTranslateCommand(command)) return
  void sendTranslateToActiveTab()
})

chrome.runtime.onMessage.addListener(
  (message: ExtensionRequest, _sender, sendResponse) => {
    void (async () => {
      switch (message.type) {
        case 'GET_STATUS':
          sendResponse(await handleStatus())
          return
        case 'REQUEST_PAGE_TRANSLATE':
          sendResponse({
            type: 'TRANSLATE_CURRENT_TEXT_RESULT',
            applied: (await sendTranslateToActiveTab()) === 'sent',
            reason: undefined,
          })
          return
        case 'TRANSLATE_TEXT':
          sendResponse(await translateViaApi(message))
          return
        case 'ACTIVATE_LICENSE':
          sendResponse(await handleActivate(message))
          return
        case 'SET_ENABLED': {
          const profile = await loadUserProfile()
          sendResponse(await handleStatusAfter(saveProfile({ ...profile, enabled: message.enabled })))
          return
        }
        case 'SET_SHORTCUT_ENABLED': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(
              saveProfile({ ...profile, shortcutEnabled: message.enabled }),
            ),
          )
          return
        }
        case 'SET_LIVE_ENABLED': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(saveProfile({ ...profile, liveEnabled: message.enabled })),
          )
          return
        }
        case 'SET_LANGUAGES': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(
              saveProfile(withLanguages(profile, message.sourceLanguage, message.targetLanguage)),
            ),
          )
          return
        }
        case 'SWAP_LANGUAGES': {
          const profile = await loadUserProfile()
          sendResponse(await handleStatusAfter(saveProfile(withSwappedLanguages(profile))))
          return
        }
        case 'SET_EXCLUDED_DOMAINS': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(
              saveProfile({
                ...profile,
                excludedDomains: normalizeExcludedDomains(message.domains),
              }),
            ),
          )
          return
        }
        case 'ADD_EXCLUDED_DOMAIN': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(
              saveProfile({
                ...profile,
                excludedDomains: addExcludedDomain(profile.excludedDomains, message.domain),
              }),
            ),
          )
          return
        }
        case 'REMOVE_EXCLUDED_DOMAIN': {
          const profile = await loadUserProfile()
          sendResponse(
            await handleStatusAfter(
              saveProfile({
                ...profile,
                excludedDomains: removeExcludedDomain(profile.excludedDomains, message.domain),
              }),
            ),
          )
          return
        }
        case 'PAUSE_TEMPORARILY': {
          const profile = await loadUserProfile()
          const ms = message.ms && message.ms > 0 ? message.ms : TEMPORARY_PAUSE_MS
          sendResponse(
            await handleStatusAfter(
              saveProfile({ ...profile, pausedUntil: Date.now() + ms }),
            ),
          )
          return
        }
        case 'NOTE_USAGE_ACTIVITY': {
          const view = await entitlement.noteActivity()
          sendResponse({
            type: 'INTERVENE_DECISION',
            decision: view.decision,
            canIntervene: view.canIntervene,
          } satisfies InterveneDecisionResult)
          return
        }
        case 'CAN_INTERVENE': {
          const decision = await entitlement.canIntervene()
          sendResponse({
            type: 'INTERVENE_DECISION',
            decision,
            canIntervene: decision === 'ALLOW',
          } satisfies InterveneDecisionResult)
          return
        }
        default:
          return
      }
    })()
    return true
  },
)

async function handleStatusAfter(_saved: Promise<UserProfile> | UserProfile): Promise<ExtensionStatus> {
  await _saved
  return handleStatus()
}

void entitlement.ensureActivated()
void loadUserProfile()
void probeApi()
