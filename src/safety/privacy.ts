import type { LanguageCode } from '../languages.ts'
import type { TranslationMode } from '../translation/types.ts'

export const TRANSLATE_FIELDS = [
  'license_key',
  'source_language',
  'target_language',
  'text',
  'context',
] as const

export type TranslatePayload = {
  license_key?: string
  source_language: LanguageCode
  target_language: LanguageCode
  text: string
  context?: { mode: TranslationMode }
}

export function buildTranslatePayload(input: TranslatePayload): TranslatePayload {
  const payload: TranslatePayload = {
    source_language: input.source_language,
    target_language: input.target_language,
    text: input.text,
  }
  if (input.license_key) payload.license_key = input.license_key
  if (input.context) payload.context = { mode: input.context.mode }
  return payload
}

export function payloadIsPrivacySafe(body: Record<string, unknown>): boolean {
  return Object.keys(body).every((key) =>
    (TRANSLATE_FIELDS as readonly string[]).includes(key),
  )
}
