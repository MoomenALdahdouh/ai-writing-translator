import type { LanguageCode } from '../languages.ts'
import type { TranslationTicket } from './types.ts'

export function isStaleTicket(
  ticket: TranslationTicket,
  live: {
    generation: number
    text: string
    start: number
    end: number
    sourceLanguage: LanguageCode
    targetLanguage: LanguageCode
  },
): boolean {
  if (ticket.elementGeneration !== live.generation) return true
  if (ticket.sourceLanguage !== live.sourceLanguage) return true
  if (ticket.targetLanguage !== live.targetLanguage) return true
  if (ticket.start !== live.start || ticket.end !== live.end) return true
  const slice = live.text.slice(live.start, live.end)
  return slice !== ticket.originalText
}

export function nextTicketId(previous: number): number {
  return previous + 1
}
