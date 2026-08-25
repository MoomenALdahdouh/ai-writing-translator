import { describe, expect, it } from 'vitest'
import { TranslationEngine, canTranslateRequest } from './engine.ts'
import type { TranslationProvider, TranslationRequest } from './types.ts'
import { isStaleTicket } from './stale.ts'
import { lastCompletedSegment } from './segments.ts'
import { resolveTranslateTarget, targetLooksProtected } from './context.ts'
import { createMemoryTranslationCache, translationCacheKey } from './cache.ts'

const PAIRS: Array<[TranslationRequest['sourceLanguage'], TranslationRequest['targetLanguage'], string, string]> = [
  ['ar', 'en', 'مرحبا، كيف حالك؟', 'Hello, how are you?'],
  ['en', 'ar', 'Hello, how are you?', 'مرحبا، كيف حالك؟'],
  ['tr', 'en', 'Merhaba, nasılsın?', 'Hello, how are you?'],
  ['en', 'tr', 'Hello, how are you?', 'Merhaba, nasılsın?'],
  ['fr', 'en', 'Bonjour, comment allez-vous ?', 'Hello, how are you?'],
  ['en', 'fr', 'Hello, how are you?', 'Bonjour, comment allez-vous ?'],
  ['es', 'en', 'Hola, ¿cómo estás?', 'Hello, how are you?'],
  ['en', 'es', 'Hello, how are you?', 'Hola, ¿cómo estás?'],
]

function fixtureProvider(): TranslationProvider {
  const table = new Map(PAIRS.map(([source, target, text, translation]) => [`${source}|${target}|${text}`, translation]))
  return {
    async translate(request) {
      const key = `${request.sourceLanguage}|${request.targetLanguage}|${request.text}`
      const translation = table.get(key)
      if (!translation) return { ok: false, code: 'invalid-response' }
      return {
        ok: true,
        result: {
          translation,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
        },
      }
    },
  }
}

describe('TranslationEngine', () => {
  it('translates fixture language pairs through the provider', async () => {
    const engine = new TranslationEngine(fixtureProvider())
    for (const [source, target, text, expected] of PAIRS) {
      const outcome = await engine.translate({
        sourceLanguage: source,
        targetLanguage: target,
        text,
        mode: 'shortcut',
      })
      expect(outcome).toEqual({
        ok: true,
        result: { translation: expected, sourceLanguage: source, targetLanguage: target },
      })
    }
  })

  it('rejects empty, same-language, and oversized requests locally', () => {
    expect(
      canTranslateRequest({
        sourceLanguage: 'ar',
        targetLanguage: 'en',
        text: '   ',
        mode: 'shortcut',
      }),
    ).toEqual({ ok: false, code: 'empty' })
    expect(
      canTranslateRequest({
        sourceLanguage: 'en',
        targetLanguage: 'en',
        text: 'hello',
        mode: 'shortcut',
      }),
    ).toEqual({ ok: false, code: 'same-language' })
    expect(
      canTranslateRequest({
        sourceLanguage: 'ar',
        targetLanguage: 'en',
        text: 'x'.repeat(4001),
        mode: 'shortcut',
      }),
    ).toEqual({ ok: false, code: 'too-long' })
  })

  it('does not call the provider when the request is invalid', async () => {
    let called = 0
    const engine = new TranslationEngine({
      async translate() {
        called += 1
        return { ok: false, code: 'network' }
      },
    })
    await engine.translate({
      sourceLanguage: 'en',
      targetLanguage: 'en',
      text: 'hello',
      mode: 'shortcut',
    })
    expect(called).toBe(0)
  })
})

describe('mixed language and preservation fixtures', () => {
  it('resolves mixed selections and full-field context', () => {
    const mixed = 'أنا working on the project اليوم.'
    const selected = resolveTranslateTarget(mixed, 0, mixed.length)
    expect(selected?.mode).toBe('selection')
    expect(selected?.text).toBe(mixed)

    const paragraph = 'First paragraph.\n\nSecond paragraph.'
    const context = resolveTranslateTarget(paragraph, paragraph.length, paragraph.length)
    expect(context?.mode).toBe('context')
    expect(context?.text).toBe('Second paragraph.')
  })

  it('treats secrets as protected and leaves emails/urls for the model to preserve', () => {
    expect(targetLooksProtected('sk-abcdefghijklmnopqrstuvwxyz123456')).toBe(true)
    expect(targetLooksProtected('تواصل معي على test@example.com')).toBe(false)
    expect(targetLooksProtected('see https://example.com')).toBe(false)
  })

  it('keeps completed sentences for live mode and ignores mid-sentence pauses', () => {
    expect(lastCompletedSegment('مرحبا كيف حالك', 15, { requireBoundary: true })).toBeNull()
    expect(lastCompletedSegment('مرحبا كيف حالك؟', 15, { requireBoundary: true })?.text).toBe(
      'مرحبا كيف حالك؟',
    )
    expect(lastCompletedSegment('Hello.\nNext', 7, { requireBoundary: true })?.text).toBe('Hello.')
  })
})

describe('stale tickets', () => {
  it('rejects a result when the user changed the text', () => {
    const ticket = {
      id: 1,
      elementGeneration: 1,
      originalText: 'مرحبا كيف حالك؟',
      start: 0,
      end: 15,
      sourceLanguage: 'ar' as const,
      targetLanguage: 'en' as const,
      mode: 'shortcut' as const,
    }
    expect(
      isStaleTicket(ticket, {
        generation: 1,
        text: 'مرحبا كيف حالك اليوم؟',
        start: 0,
        end: 15,
        sourceLanguage: 'ar',
        targetLanguage: 'en',
      }),
    ).toBe(true)
    expect(
      isStaleTicket(ticket, {
        generation: 1,
        text: 'مرحبا كيف حالك؟',
        start: 0,
        end: 15,
        sourceLanguage: 'ar',
        targetLanguage: 'en',
      }),
    ).toBe(false)
  })
})

describe('memory cache', () => {
  it('stores translations briefly and never grows without bound', () => {
    const cache = createMemoryTranslationCache(1_000, 2)
    const first = translationCacheKey('ar', 'en', 'a')
    const second = translationCacheKey('ar', 'en', 'b')
    const third = translationCacheKey('ar', 'en', 'c')
    cache.set(first, 'A')
    cache.set(second, 'B')
    cache.set(third, 'C')
    expect(cache.size()).toBeLessThanOrEqual(2)
    expect(cache.get(first, Date.now() + 2_000)).toBeUndefined()
  })
})
