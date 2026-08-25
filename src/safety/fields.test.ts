/** @vitest-environment happy-dom */

import { describe, expect, it } from 'vitest'
import { isValueEditable } from '../dom/read.ts'
import { probeElement, skipReasonForField } from './fields.ts'

function input(attrs: Record<string, string>): HTMLInputElement {
  const el = document.createElement('input')
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'type') el.type = value
    else el.setAttribute(key, value)
  }
  document.body.append(el)
  return el
}

describe('protected fields', () => {
  it('protects password, OTP, payment, email, and URL controls', () => {
    expect(skipReasonForField(probeElement(input({ type: 'password' })))).toBe('password-field')
    expect(
      skipReasonForField(probeElement(input({ type: 'text', autocomplete: 'one-time-code' }))),
    ).toBe('otp-field')
    expect(skipReasonForField(probeElement(input({ id: 'cvv', name: 'cvc' })))).toBe('payment-field')
    expect(skipReasonForField(probeElement(input({ type: 'email' })))).toBe('email-field')
    expect(skipReasonForField(probeElement(input({ type: 'url' })))).toBe('url-field')
    expect(skipReasonForField(probeElement(input({ type: 'text', name: 'comment' })))).toBeNull()
  })

  it('does not treat email, URL, password, or file inputs as editable', () => {
    expect(isValueEditable(input({ type: 'text' }))).toBe(true)
    expect(isValueEditable(input({ type: 'password' }))).toBe(false)
    expect(isValueEditable(input({ type: 'email' }))).toBe(false)
    expect(isValueEditable(input({ type: 'url' }))).toBe(false)
    expect(isValueEditable(input({ type: 'file' }))).toBe(false)
  })
})
