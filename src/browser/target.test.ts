import { describe, expect, it } from 'vitest'
import { extensionTarget, manifestForTarget, resolveExtensionBrowser } from '../../build/target.ts'

describe('extension build targets', () => {
  it('defaults to the Chrome output directory', () => {
    expect(resolveExtensionBrowser(undefined)).toBe('chrome')
    expect(extensionTarget().outDir).toBe('dist/chrome')
    expect(extensionTarget('edge').outDir).toBe('dist/edge')
  })

  it('keeps the translator name on both targets', () => {
    const base = { name: 'Lingo', version: '0.1.0', manifest_version: 3 }
    expect(manifestForTarget(base, 'chrome').name).toBe('Lingo')
    expect(manifestForTarget(base, 'edge').name).toBe('Lingo')
    expect(manifestForTarget(base, 'edge').manifest_version).toBe(3)
  })

  it('rejects unknown browser ids', () => {
    expect(() => resolveExtensionBrowser('firefox')).toThrow(/Unknown/)
  })
})
