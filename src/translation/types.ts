import type { LanguageCode } from '../languages.ts'

export type TranslationMode = 'shortcut' | 'live'

export type TranslationRequest = {
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  text: string
  mode: TranslationMode
}

export type TranslationResult = {
  translation: string
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
}

export type TranslationFailureCode =
  | 'empty'
  | 'same-language'
  | 'too-long'
  | 'protected'
  | 'network'
  | 'upstream'
  | 'invalid-response'
  | 'license'
  | 'rate-limited'
  | 'usage'

export type TranslationFailure = {
  ok: false
  code: TranslationFailureCode
}

export type TranslationSuccess = {
  ok: true
  result: TranslationResult
}

export type TranslationOutcome = TranslationSuccess | TranslationFailure

export type TranslationProvider = {
  translate(request: TranslationRequest): Promise<TranslationOutcome>
}

export type TranslationTicket = {
  id: number
  elementGeneration: number
  originalText: string
  start: number
  end: number
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  mode: TranslationMode
}

export const MAX_TRANSLATION_CHARS = 4_000
