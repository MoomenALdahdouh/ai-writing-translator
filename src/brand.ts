/** Working product identity. Change here to rename the public brand. */
export const BRAND = {
  id: 'lingo',
  name: 'Lingo',
  fullName: 'Lingo',
  tagline: 'Write naturally. Translate instantly.',
  description:
    'Translate the text you are writing — in place — without leaving the page.',
} as const

export const PRODUCT_ID = 'LINGO'
export const USAGE_PRODUCT_ID = 'LINGO_USAGE'

/** Manifest V3 command. Distinct from Autofix FIX_CURRENT_TEXT. */
export const TRANSLATE_COMMAND = 'TRANSLATE_CURRENT_TEXT'
export const TRANSLATE_SHORTCUT_HINT = 'Ctrl/⌘+Shift+,'

export const PAGE_MARKER = 'lingo'
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8004'
