export type ExtensionBrowser = 'chrome' | 'edge'

export type ExtensionTarget = {
  browser: ExtensionBrowser
  outDir: string
  name: string
}

const PRODUCT_NAME = 'Lingo'

const TARGETS: Record<ExtensionBrowser, ExtensionTarget> = {
  chrome: { browser: 'chrome', outDir: 'dist/chrome', name: PRODUCT_NAME },
  edge: { browser: 'edge', outDir: 'dist/edge', name: PRODUCT_NAME },
}

export function resolveExtensionBrowser(raw: string | undefined): ExtensionBrowser {
  const value = (raw ?? 'chrome').trim().toLowerCase()
  if (value === 'edge') return 'edge'
  if (value === 'chrome' || value === '') return 'chrome'
  throw new Error(`Unknown TRANSLATOR_BROWSER "${raw}". Use chrome or edge.`)
}

export function extensionTarget(raw?: string): ExtensionTarget {
  return TARGETS[resolveExtensionBrowser(raw)]
}

export function manifestForTarget(
  base: Record<string, unknown>,
  browser: ExtensionBrowser,
): Record<string, unknown> {
  const target = TARGETS[browser]
  return {
    ...base,
    name: target.name,
    manifest_version: 3,
  }
}
