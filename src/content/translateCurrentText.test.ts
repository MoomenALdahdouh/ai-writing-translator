/** @vitest-environment happy-dom */

import { describe, expect, it } from 'vitest'
import { setNativeValue } from '../dom/index.ts'
import { translateCurrentText, type TranslateHost } from './translateCurrentText.ts'

function host(overrides: Partial<TranslateHost> = {}): TranslateHost {
  return {
    shortcutEnabled: true,
    composing: false,
    pageBlocked: false,
    sourceLanguage: 'ar',
    targetLanguage: 'en',
    fieldBlocked: () => false,
    usageAllowed: async () => true,
    requestTranslation: async (text) => `T(${text})`,
    writeFix: () => true,
    ...overrides,
  }
}

function focusInput(value: string, start = 0, end = value.length): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  document.body.append(input)
  setNativeValue(input, value)
  input.focus()
  input.setSelectionRange(start, end)
  return input
}

describe('translateCurrentText', () => {
  it('translates a selection only', async () => {
    const sentence = 'I want شراء هذا المنتج today.'
    const selected = 'شراء هذا المنتج'
    const start = sentence.indexOf(selected)
    const field = focusInput(sentence, start, start + selected.length)
    let seen = ''
    const result = await translateCurrentText(
      host({
        requestTranslation: async (text) => {
          seen = text
          return 'buy this product'
        },
        writeFix: (snapshot, translation) => {
          expect(snapshot.originalWord).toBe('شراء هذا المنتج')
          expect(translation).toBe('buy this product')
          return true
        },
      }),
    )
    expect(seen).toBe('شراء هذا المنتج')
    expect(result.applied).toBe(true)
    field.remove()
  })

  it('uses current writing context when nothing is selected', async () => {
    const field = focusInput('مرحبا، كيف حالك؟', 16, 16)
    let seen = ''
    const result = await translateCurrentText(
      host({
        requestTranslation: async (text) => {
          seen = text
          return 'Hello, how are you?'
        },
      }),
    )
    expect(seen).toBe('مرحبا، كيف حالك؟')
    expect(result.applied).toBe(true)
    field.remove()
  })

  it('does not overwrite when the field changed before the result returns', async () => {
    const field = focusInput('مرحبا كيف حالك؟')
    const result = await translateCurrentText(
      host({
        requestTranslation: async () => {
          setNativeValue(field, 'نص جديد بالكامل')
          return 'Hello, how are you?'
        },
      }),
    )
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('stale')
    expect(field.value).toBe('نص جديد بالكامل')
    field.remove()
  })

  it('no-ops on protected fields and never requests a translation', async () => {
    let called = 0
    focusInput('123456')
    const result = await translateCurrentText(
      host({
        fieldBlocked: () => true,
        requestTranslation: async () => {
          called += 1
          return 'no'
        },
      }),
    )
    expect(result.reason).toBe('unsupported')
    expect(called).toBe(0)
  })

  it('does not send a secret-looking selection', async () => {
    let called = 0
    focusInput('sk-abcdefghijklmnopqrstuvwxyz123456')
    const result = await translateCurrentText(
      host({
        requestTranslation: async () => {
          called += 1
          return 'no'
        },
      }),
    )
    expect(result.reason).toBe('protected')
    expect(called).toBe(0)
  })

  it('leaves the original text when the API fails', async () => {
    const field = focusInput('مرحبا')
    const result = await translateCurrentText(
      host({
        requestTranslation: async () => null,
      }),
    )
    expect(result.applied).toBe(false)
    expect(result.reason).toBe('failed')
    expect(field.value).toBe('مرحبا')
    field.remove()
  })
})
