export type LanguageCode =
  | 'en'
  | 'ar'
  | 'tr'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko'

export type LanguageOption = {
  code: LanguageCode
  name: string
  native: string
  direction: 'ltr' | 'rtl'
  /** Listed for the MVP. Quality is not claimed until a pair is tested. */
  mvp: true
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', direction: 'ltr', mvp: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', direction: 'rtl', mvp: true },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', direction: 'ltr', mvp: true },
  { code: 'es', name: 'Spanish', native: 'Español', direction: 'ltr', mvp: true },
  { code: 'fr', name: 'French', native: 'Français', direction: 'ltr', mvp: true },
  { code: 'de', name: 'German', native: 'Deutsch', direction: 'ltr', mvp: true },
  { code: 'pt', name: 'Portuguese', native: 'Português', direction: 'ltr', mvp: true },
  { code: 'it', name: 'Italian', native: 'Italiano', direction: 'ltr', mvp: true },
  { code: 'ru', name: 'Russian', native: 'Русский', direction: 'ltr', mvp: true },
  { code: 'zh', name: 'Chinese', native: '中文', direction: 'ltr', mvp: true },
  { code: 'ja', name: 'Japanese', native: '日本語', direction: 'ltr', mvp: true },
  { code: 'ko', name: 'Korean', native: '한국어', direction: 'ltr', mvp: true },
] as const

const CODES = new Set<string>(SUPPORTED_LANGUAGES.map((item) => item.code))

export const DEFAULT_SOURCE_LANGUAGE: LanguageCode = 'ar'
export const DEFAULT_TARGET_LANGUAGE: LanguageCode = 'en'

export function isSupportedLanguage(value: unknown): value is LanguageCode {
  return typeof value === 'string' && CODES.has(value)
}

export function languageByCode(code: LanguageCode): LanguageOption {
  return SUPPORTED_LANGUAGES.find((item) => item.code === code) ?? SUPPORTED_LANGUAGES[0]!
}

export function normalizeLanguage(
  value: unknown,
  fallback: LanguageCode,
): LanguageCode {
  return isSupportedLanguage(value) ? value : fallback
}

export function swapLanguages(
  source: LanguageCode,
  target: LanguageCode,
): { sourceLanguage: LanguageCode; targetLanguage: LanguageCode } {
  return { sourceLanguage: target, targetLanguage: source }
}
