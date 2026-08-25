import type { EntitlementView } from './entitlement/types.ts'
import type { LanguageCode } from './languages.ts'
import type { UserProfile } from './profile/types.ts'
import type { TranslationFailureCode, TranslationMode } from './translation/types.ts'

export type TranslateTextRequest = {
  type: 'TRANSLATE_TEXT'
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  text: string
  mode: TranslationMode
}

export type TranslateTextResult = {
  type: 'TRANSLATE_TEXT_RESULT'
  ok: true
  translation: string
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
}

export type TranslateTextError = {
  type: 'TRANSLATE_TEXT_ERROR'
  ok: false
  code: TranslationFailureCode
}

export type ActivateLicenseRequest = {
  type: 'ACTIVATE_LICENSE'
  licenseKey: string
}

export type ActivateLicenseResult = {
  type: 'ACTIVATE_LICENSE_RESULT'
  ok: boolean
  licenseRequired: boolean
  status: string
  error?: string
}

export type GetStatusRequest = {
  type: 'GET_STATUS'
}

export type ExtensionStatus = {
  type: 'STATUS'
  enabled: boolean
  shortcutEnabled: boolean
  liveEnabled: boolean
  commandShortcut: string
  licenseKey: string
  licenseRequired: boolean
  apiBaseUrl: string
  apiReachable: boolean
  lastError: string
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  excludedDomains: string[]
  pausedUntil: number
  languages: Array<{ code: LanguageCode; name: string; native: string }>
  entitlement: EntitlementView
}

export type SetEnabledRequest = {
  type: 'SET_ENABLED'
  enabled: boolean
}

export type SetShortcutEnabledRequest = {
  type: 'SET_SHORTCUT_ENABLED'
  enabled: boolean
}

export type SetLiveEnabledRequest = {
  type: 'SET_LIVE_ENABLED'
  enabled: boolean
}

export type SetLanguagesRequest = {
  type: 'SET_LANGUAGES'
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
}

export type SwapLanguagesRequest = {
  type: 'SWAP_LANGUAGES'
}

export type TranslateCurrentTextRequest = {
  type: 'TRANSLATE_CURRENT_TEXT'
}

export type RequestPageTranslateRequest = {
  type: 'REQUEST_PAGE_TRANSLATE'
}

export type TranslateCurrentTextResult = {
  type: 'TRANSLATE_CURRENT_TEXT_RESULT'
  applied: boolean
  reason?:
    | 'disabled'
    | 'composing'
    | 'blocked'
    | 'usage'
    | 'no-target'
    | 'unsupported'
    | 'protected'
    | 'noop'
    | 'stale'
    | 'failed'
}

export type SetExcludedDomainsRequest = {
  type: 'SET_EXCLUDED_DOMAINS'
  domains: string[]
}

export type AddExcludedDomainRequest = {
  type: 'ADD_EXCLUDED_DOMAIN'
  domain: string
}

export type RemoveExcludedDomainRequest = {
  type: 'REMOVE_EXCLUDED_DOMAIN'
  domain: string
}

export type PauseTemporarilyRequest = {
  type: 'PAUSE_TEMPORARILY'
  ms?: number
}

export type NoteUsageActivityRequest = {
  type: 'NOTE_USAGE_ACTIVITY'
}

export type CanInterveneRequest = {
  type: 'CAN_INTERVENE'
}

export type InterveneDecisionResult = {
  type: 'INTERVENE_DECISION'
  decision: 'ALLOW' | 'DENY'
  canIntervene: boolean
}

export type ExtensionRequest =
  | TranslateTextRequest
  | ActivateLicenseRequest
  | GetStatusRequest
  | SetEnabledRequest
  | SetShortcutEnabledRequest
  | SetLiveEnabledRequest
  | SetLanguagesRequest
  | SwapLanguagesRequest
  | TranslateCurrentTextRequest
  | RequestPageTranslateRequest
  | SetExcludedDomainsRequest
  | AddExcludedDomainRequest
  | RemoveExcludedDomainRequest
  | PauseTemporarilyRequest
  | NoteUsageActivityRequest
  | CanInterveneRequest

export type ExtensionResponse =
  | TranslateTextResult
  | TranslateTextError
  | ActivateLicenseResult
  | ExtensionStatus
  | InterveneDecisionResult
  | TranslateCurrentTextResult

export type { UserProfile }
