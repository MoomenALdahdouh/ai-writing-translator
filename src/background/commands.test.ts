import { describe, expect, it } from 'vitest'
import manifest from '../../manifest.json' with { type: 'json' }
import { TRANSLATE_COMMAND } from '../brand.ts'
import {
  displayCommandShortcut,
  extensionShortcutsPage,
  isTranslateCommand,
  readAssignedShortcut,
  sendTranslateToActiveTab,
} from './commands.ts'

describe('command registration', () => {
  it('registers TRANSLATE_CURRENT_TEXT and does not use the Autofix command', () => {
    const command = manifest.commands.TRANSLATE_CURRENT_TEXT
    expect(command.suggested_key.default).toBe('Ctrl+Shift+Comma')
    expect(command.suggested_key.mac).toBe('Command+Shift+Comma')
    expect(TRANSLATE_COMMAND).toBe('TRANSLATE_CURRENT_TEXT')
    expect(manifest.commands).not.toHaveProperty('FIX_CURRENT_TEXT')
  })
})

describe('service-worker command dispatch', () => {
  it('sends TRANSLATE_CURRENT_TEXT to the active tab and no field text', async () => {
    const sent: unknown[] = []
    const api = {
      tabs: {
        query: async () => [{ id: 9 }],
        sendMessage: async (tabId: number, message: unknown) => {
          sent.push({ tabId, message })
        },
      },
    }
    await expect(sendTranslateToActiveTab(api as unknown as typeof chrome)).resolves.toBe('sent')
    expect(sent).toEqual([{ tabId: 9, message: { type: 'TRANSLATE_CURRENT_TEXT' } }])
  })

  it('is a no-op when there is no tab or the content script is missing', async () => {
    await expect(
      sendTranslateToActiveTab({
        tabs: {
          query: async () => [],
          sendMessage: async () => undefined,
        },
      } as unknown as typeof chrome),
    ).resolves.toBe('noop')
  })

  it('ignores other command names', () => {
    expect(isTranslateCommand('TRANSLATE_CURRENT_TEXT')).toBe(true)
    expect(isTranslateCommand('FIX_CURRENT_TEXT')).toBe(false)
  })
})

describe('shortcut assignment', () => {
  it('reads assigned shortcuts and maps Chrome/Edge settings pages', () => {
    expect(
      readAssignedShortcut([{ name: 'TRANSLATE_CURRENT_TEXT', shortcut: 'Ctrl+Shift+Comma' }]),
    ).toBe('Ctrl+Shift+Comma')
    expect(displayCommandShortcut('Ctrl+Shift+Comma')).toBe('Ctrl+Shift+,')
    expect(extensionShortcutsPage('Mozilla/5.0 Chrome/120')).toBe('chrome://extensions/shortcuts')
    expect(extensionShortcutsPage('Mozilla/5.0 Edg/14.0')).toBe('edge://extensions/shortcuts')
  })
})
