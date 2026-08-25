import { useEffect, useState } from 'react'
import { extensionShortcutsPage } from '../background/commands.ts'
import { BRAND, TRANSLATE_SHORTCUT_HINT } from '../brand.ts'
import type { LanguageCode } from '../languages.ts'
import type { ActivateLicenseResult, ExtensionStatus } from '../messaging.ts'
import { isProductActive } from '../profile/index.ts'
import { Mark } from '../ui/Mark.tsx'
import { Switch } from '../ui/Switch.tsx'
import { EntitlementCard } from './EntitlementCard.tsx'
import { SettingsPanel, friendlyActivateMessage } from './SettingsPanel.tsx'

const EMPTY_STATUS: ExtensionStatus = {
  type: 'STATUS',
  enabled: true,
  shortcutEnabled: true,
  liveEnabled: false,
  commandShortcut: '',
  licenseKey: '',
  licenseRequired: false,
  apiBaseUrl: 'http://127.0.0.1:8004',
  apiReachable: false,
  sourceLanguage: 'ar',
  targetLanguage: 'en',
  excludedDomains: [],
  pausedUntil: 0,
  lastError: '',
  languages: [],
  entitlement: {
    state: 'TRIAL',
    decision: 'ALLOW',
    remainingMs: 0,
    nextRefillInMs: null,
    trialRemainingMs: null,
    limitReached: false,
    canIntervene: true,
  },
}

function App() {
  const [status, setStatus] = useState<ExtensionStatus>(EMPTY_STATUS)
  const [licenseInput, setLicenseInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [domainDraft, setDomainDraft] = useState('')
  const [tabHost, setTabHost] = useState('')
  const [showLicense, setShowLicense] = useState(false)
  const [translateBusy, setTranslateBusy] = useState(false)
  const [translateHint, setTranslateHint] = useState('')

  const live = isProductActive({
    enabled: status.enabled,
    pausedUntil: status.pausedUntil,
  })
  const ready = live && status.entitlement.canIntervene && status.apiReachable
  const liveLabel = !status.enabled
    ? 'Off'
    : !live
      ? 'Paused'
      : status.entitlement.limitReached
        ? 'Paused'
        : !status.apiReachable
          ? 'API offline'
          : ready
            ? 'Ready'
            : 'Paused'

  useEffect(() => {
    void chrome.runtime.sendMessage({ type: 'GET_STATUS' }).then((next) => {
      const value = next as ExtensionStatus
      setStatus(value)
      setLicenseInput(value.licenseKey)
    })
    void chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      try {
        const host = new URL(tabs[0]?.url ?? '').hostname
        if (host && host !== 'null') setTabHost(host)
      } catch {
        setTabHost('')
      }
    })
  }, [])

  async function refresh(): Promise<ExtensionStatus> {
    const next = (await chrome.runtime.sendMessage({
      type: 'GET_STATUS',
    })) as ExtensionStatus
    setStatus(next)
    return next
  }

  async function activate(): Promise<void> {
    setBusy(true)
    setMessage('')
    const result = (await chrome.runtime.sendMessage({
      type: 'ACTIVATE_LICENSE',
      licenseKey: licenseInput.trim(),
    })) as ActivateLicenseResult
    setBusy(false)
    setMessage(friendlyActivateMessage(result))
    await refresh()
  }

  async function setLanguages(sourceLanguage: LanguageCode, targetLanguage: LanguageCode): Promise<void> {
    const next = (await chrome.runtime.sendMessage({
      type: 'SET_LANGUAGES',
      sourceLanguage,
      targetLanguage,
    })) as ExtensionStatus
    setStatus(next)
  }

  return (
    <main className="popup">
      <header className="brand">
        <Mark size={28} />
        <div className="brand-copy">
          <h1>{BRAND.name}</h1>
          <p className="lede">{BRAND.tagline}</p>
        </div>
        <span className={`live ${ready ? 'on' : ''}`}>
          <i />
          {liveLabel}
        </span>
      </header>

      <section className="lang-card">
        <h2>Languages</h2>
        <div className="lang-pair">
          <div className="lang-field">
            <label htmlFor="source-language">Write in</label>
            <select
              id="source-language"
              value={status.sourceLanguage}
              onChange={(event) => {
                void setLanguages(event.target.value as LanguageCode, status.targetLanguage)
              }}
            >
              {status.languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="converter-swap"
            aria-label="Swap languages"
            onClick={() => {
              void chrome.runtime.sendMessage({ type: 'SWAP_LANGUAGES' }).then((next) => {
                setStatus(next as ExtensionStatus)
              })
            }}
          >
            ⇄
          </button>
          <div className="lang-field">
            <label htmlFor="target-language">Translate to</label>
            <select
              id="target-language"
              value={status.targetLanguage}
              onChange={(event) => {
                void setLanguages(status.sourceLanguage, event.target.value as LanguageCode)
              }}
            >
              {status.languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          className="primary"
          disabled={!ready || translateBusy}
          onClick={() => {
            setTranslateBusy(true)
            setTranslateHint('')
            void chrome.runtime
              .sendMessage({ type: 'REQUEST_PAGE_TRANSLATE' })
              .then(() => {
                setTranslateHint(
                  'Sent to the page. Click the search box, wait a second, or use ⇧⌘,.',
                )
              })
              .finally(() => setTranslateBusy(false))
          }}
        >
          {translateBusy ? 'Translating…' : 'Translate current text'}
        </button>
        {translateHint ? <p>{translateHint}</p> : null}
        {!status.apiReachable ? (
          <p className="error">
            Start the Lingo API on {status.apiBaseUrl}. Live and shortcut do nothing until it is
            reachable.
          </p>
        ) : null}
        {status.lastError ? <p className="error">{status.lastError}</p> : null}
      </section>

      <section className="toggle-row">
        <div>
          <h2>Translate on shortcut</h2>
          <p>Replace selected or current text in the focused field.</p>
        </div>
        <Switch
          checked={status.shortcutEnabled}
          label="Translate on shortcut"
          onToggle={() => {
            void chrome.runtime
              .sendMessage({ type: 'SET_SHORTCUT_ENABLED', enabled: !status.shortcutEnabled })
              .then((next) => setStatus(next as ExtensionStatus))
          }}
        />
      </section>

      <section className="toggle-row">
        <div>
          <h2>Live translation</h2>
          <p>After you pause, translate the current text. Typing is never blocked.</p>
        </div>
        <Switch
          checked={status.liveEnabled}
          label="Live translation"
          onToggle={() => {
            void chrome.runtime
              .sendMessage({ type: 'SET_LIVE_ENABLED', enabled: !status.liveEnabled })
              .then((next) => setStatus(next as ExtensionStatus))
          }}
        />
      </section>

      <section className="toggle-row shortcut-row">
        <div>
          <h2>Shortcut</h2>
          <p className="shortcut-keys">
            {status.commandShortcut
              ? status.commandShortcut.replace(/Period/g, '.').replace(/Comma/g, ',')
              : TRANSLATE_SHORTCUT_HINT}
          </p>
          <p>Change this in the browser’s extension shortcut settings.</p>
        </div>
        <button
          type="button"
          className="ghost compact"
          onClick={() => {
            void chrome.tabs.create({ url: extensionShortcutsPage(navigator.userAgent) })
          }}
        >
          Edit
        </button>
      </section>

      <section className="toggle-row">
        <div>
          <h2>Extension</h2>
          <p>Master switch. Off means no translation runs.</p>
        </div>
        <Switch
          checked={status.enabled}
          label="Enable extension"
          onToggle={() => {
            void chrome.runtime
              .sendMessage({ type: 'SET_ENABLED', enabled: !status.enabled })
              .then((next) => setStatus(next as ExtensionStatus))
          }}
        />
      </section>

      <EntitlementCard
        entitlement={status.entitlement}
        onUpgrade={() => setShowLicense(true)}
      />

      <SettingsPanel
        status={status}
        licenseInput={licenseInput}
        busy={busy}
        message={message}
        domainDraft={domainDraft}
        tabHost={tabHost}
        showLicense={showLicense}
        onLicenseInput={setLicenseInput}
        onActivate={() => void activate()}
        onDomainDraft={setDomainDraft}
        onAddDomain={(domain) => {
          const value = (domain ?? domainDraft).trim()
          if (!value) return
          void chrome.runtime
            .sendMessage({ type: 'ADD_EXCLUDED_DOMAIN', domain: value })
            .then((next) => {
              setStatus(next as ExtensionStatus)
              setDomainDraft('')
            })
        }}
        onRemoveDomain={(domain) => {
          void chrome.runtime
            .sendMessage({ type: 'REMOVE_EXCLUDED_DOMAIN', domain })
            .then((next) => setStatus(next as ExtensionStatus))
        }}
        onPlayground={() => {
          void chrome.runtime.openOptionsPage()
        }}
      />

      <footer className="foot">
        <p>
          {status.apiReachable ? `API ready · ${status.apiBaseUrl}` : `API offline · ${status.apiBaseUrl}`}
        </p>
      </footer>
    </main>
  )
}

export default App
