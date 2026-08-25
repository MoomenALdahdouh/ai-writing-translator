import { TRANSLATE_COMMAND } from '../brand.ts'
import { extensionApi } from '../browser/extensionApi.ts'

export { TRANSLATE_COMMAND }

export type CommandDispatch = 'sent' | 'noop'

export async function sendTranslateToActiveTab(
  api: Pick<typeof chrome, 'tabs'> = extensionApi(),
): Promise<CommandDispatch> {
  try {
    const tabs = await api.tabs.query({ active: true, currentWindow: true })
    const tabId = tabs[0]?.id
    if (tabId == null) return 'noop'
    await api.tabs.sendMessage(tabId, { type: 'TRANSLATE_CURRENT_TEXT' })
    return 'sent'
  } catch {
    return 'noop'
  }
}

export function isTranslateCommand(command: string): boolean {
  return command === TRANSLATE_COMMAND
}

export function readAssignedShortcut(
  commands: Array<{ name?: string; shortcut?: string }>,
  name = TRANSLATE_COMMAND,
): string {
  return commands.find((item) => item.name === name)?.shortcut ?? ''
}

export function displayCommandShortcut(shortcut: string): string {
  if (!shortcut) return ''
  return shortcut.replace(/Period/g, '.').replace(/Comma/g, ',')
}

export function extensionShortcutsPage(userAgent = ''): string {
  return /Edg\//i.test(userAgent) ? 'edge://extensions/shortcuts' : 'chrome://extensions/shortcuts'
}
