import { describe, expect, it } from 'vitest'
import { BRAND, PRODUCT_ID } from './brand.ts'
import { DEFAULT_API_BASE_URL } from './brand.ts'

describe('secrets stay off the extension contract', () => {
  it('does not put provider secrets on public identity values', () => {
    const blob = JSON.stringify({ BRAND, PRODUCT_ID, DEFAULT_API_BASE_URL })
    expect(blob).not.toMatch(/gsk_/)
    expect(blob).not.toContain('GROQ')
    expect(blob).not.toContain('LEMON_SQUEEZY')
  })
})
