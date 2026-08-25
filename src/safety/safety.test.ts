import { describe, expect, it } from 'vitest'
import { isExcludedHost, normalizeExcludedDomains } from './domains.ts'
import { skipReasonForField } from './fields.ts'
import { isInsideMarkdownCode } from './markdown.ts'
import { skipReasonForToken } from './tokenKind.ts'
import { lastCompletedToken, tokenizeText } from './tokenize.ts'
import { payloadIsPrivacySafe } from './privacy.ts'

const JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'

describe('tokenizer', () => {
  it('keeps letters, hyphens, apostrophes, and underscores', () => {
    const { tokens } = tokenizeText("don't state-of-the-art foo_bar")
    expect(tokens.map((item) => item.token)).toEqual([
      "don't",
      'state-of-the-art',
      'foo_bar',
    ])
  })

  it('requires a boundary for the last completed token', () => {
    expect(lastCompletedToken('hello', 5, true)).toBeNull()
    expect(lastCompletedToken('hello ', 6, true)?.token).toBe('hello')
  })
})

describe('token protection', () => {
  it('skips emails, urls, secrets, and cards', () => {
    expect(skipReasonForToken('test@example.com')).toBe('email')
    expect(skipReasonForToken('https://example.com')).toBe('url')
    expect(skipReasonForToken(JWT)).toBe('jwt')
    expect(skipReasonForToken('sk-abcdefghijklmnopqrstuvwxyz123456')).toBe('api-key')
    expect(skipReasonForToken('4111 1111 1111 1111')).toBe('credit-card')
  })
})

describe('field protection', () => {
  it('classifies password, otp, payment, email, and url fields', () => {
    expect(skipReasonForField({ tag: 'INPUT', type: 'password' })).toBe('password-field')
    expect(skipReasonForField({ tag: 'INPUT', type: 'text', autocomplete: 'one-time-code' })).toBe(
      'otp-field',
    )
    expect(skipReasonForField({ tag: 'INPUT', type: 'text', autocomplete: 'cc-number' })).toBe(
      'payment-field',
    )
    expect(skipReasonForField({ tag: 'INPUT', type: 'email' })).toBe('email-field')
    expect(skipReasonForField({ tag: 'INPUT', type: 'url' })).toBe('url-field')
    expect(skipReasonForField({ tag: 'INPUT', type: 'text', name: 'comment' })).toBeNull()
  })
})

describe('domains and markdown', () => {
  it('matches excluded hosts and subdomains', () => {
    const domains = normalizeExcludedDomains(['Bank.Example'])
    expect(isExcludedHost('bank.example', domains)).toBe(true)
    expect(isExcludedHost('app.bank.example', domains)).toBe(true)
    expect(isExcludedHost('example.com', domains)).toBe(false)
  })

  it('detects markdown code regions', () => {
    expect(isInsideMarkdownCode('```\nsecret', 8)).toBe(true)
    expect(isInsideMarkdownCode('hello `code', 11)).toBe(true)
    expect(isInsideMarkdownCode('hello world', 5)).toBe(false)
  })
})

describe('translate payload allowlist', () => {
  it('rejects unexpected fields', () => {
    expect(
      payloadIsPrivacySafe({
        source_language: 'ar',
        target_language: 'en',
        text: 'hi',
      }),
    ).toBe(true)
    expect(
      payloadIsPrivacySafe({
        source_language: 'ar',
        target_language: 'en',
        text: 'hi',
        html: '<p>',
      }),
    ).toBe(false)
  })
})
