/** @vitest-environment happy-dom */

import { describe, expect, it } from 'vitest'
import { adjustCaret } from './caret.ts'
import {
  bumpGeneration,
  captureSnapshot,
  commitReplacement,
  readFieldText,
  setNativeValue,
} from './index.ts'

function valueField(value: string): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  document.body.append(input)
  setNativeValue(input, value)
  input.setSelectionRange(value.length, value.length)
  return input
}

function areaField(value: string): HTMLTextAreaElement {
  const area = document.createElement('textarea')
  document.body.append(area)
  setNativeValue(area, value)
  area.setSelectionRange(value.length, value.length)
  return area
}

describe('value replacement', () => {
  it('uses the native setter and insertReplacementText', () => {
    const input = valueField('مرحبا ')
    const events: string[] = []
    input.addEventListener('input', (event) => {
      events.push((event as InputEvent).inputType)
    })
    const snapshot = captureSnapshot(input, 'value', 'مرحبا', 0, 5, 6)
    expect(commitReplacement(snapshot, 'Hello')).toBe('written')
    expect(input.value).toBe('Hello ')
    expect(events).toEqual(['insertReplacementText'])
    expect(input.selectionStart).toBe(6)
  })

  it('notifies a React-style controlled listener', () => {
    const input = valueField('مرحبا ')
    let state = input.value
    input.addEventListener('input', () => {
      state = input.value
    })
    const snapshot = captureSnapshot(input, 'value', 'مرحبا', 0, 5, 6)
    commitReplacement(snapshot, 'Hello')
    expect(state).toBe('Hello ')
  })

  it('replaces only the selected range in a longer field', () => {
    const input = valueField('I want شراء هذا المنتج today.')
    const start = 'I want '.length
    const end = start + 'شراء هذا المنتج'.length
    const snapshot = captureSnapshot(input, 'value', 'شراء هذا المنتج', start, end, end)
    expect(commitReplacement(snapshot, 'buy this product', true, input, { placeCaretAfter: true })).toBe(
      'written',
    )
    expect(input.value).toBe('I want buy this product today.')
    expect(input.selectionStart).toBe('I want buy this product'.length)
  })

  it('discards a write when the original slice no longer matches', () => {
    const input = valueField('مرحبا')
    const snapshot = captureSnapshot(input, 'value', 'مرحبا', 0, 5, 5)
    setNativeValue(input, 'changed')
    expect(commitReplacement(snapshot, 'Hello')).toBe('discarded')
    expect(input.value).toBe('changed')
  })

  it('works on textareas', () => {
    const area = areaField('hola\nmundo')
    const snapshot = captureSnapshot(area, 'value', 'hola\nmundo', 0, 10, 10)
    expect(commitReplacement(snapshot, 'hello\nworld')).toBe('written')
    expect(area.value).toBe('hello\nworld')
  })
})

describe('contenteditable replacement', () => {
  it('replaces a text range without rewriting the page', () => {
    const edit = document.createElement('div')
    edit.contentEditable = 'true'
    edit.textContent = 'مرحبا'
    document.body.append(edit)
    const snapshot = captureSnapshot(edit, 'contenteditable', 'مرحبا', 0, 5, 5)
    expect(commitReplacement(snapshot, 'Hello')).toBe('written')
    expect(readFieldText(edit)).toBe('Hello')
  })
})

describe('caret math', () => {
  it('keeps the caret after a shorter or longer replacement', () => {
    expect(adjustCaret(8, 0, 2, 2)).toBe(8)
    expect(adjustCaret(8, 0, 5, 5)).toBe(8)
    expect(adjustCaret(3, 0, 5, 10)).toBe(10)
    bumpGeneration(valueField('x'))
  })
})
