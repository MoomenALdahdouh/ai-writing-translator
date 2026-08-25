import type { ActivateLicenseResult, ExtensionStatus } from '../messaging.ts'

type Props = {
  status: ExtensionStatus
  licenseInput: string
  busy: boolean
  message: string
  domainDraft: string
  tabHost: string
  showLicense: boolean
  onLicenseInput: (value: string) => void
  onActivate: () => void
  onDomainDraft: (value: string) => void
  onAddDomain: (domain?: string) => void
  onRemoveDomain: (domain: string) => void
  onPlayground: () => void
}

export function SettingsPanel({
  status,
  licenseInput,
  busy,
  message,
  domainDraft,
  tabHost,
  showLicense,
  onLicenseInput,
  onActivate,
  onDomainDraft,
  onAddDomain,
  onRemoveDomain,
  onPlayground,
}: Props) {
  const canExcludeTab =
    Boolean(tabHost) &&
    !status.excludedDomains.some((item) => tabHost === item || tabHost.endsWith(`.${item}`))

  return (
    <details className="settings" open={showLicense}>
      <summary>Settings</summary>

      <section className="panel">
        <p>Never translate on this website.</p>
        <div className="row">
          <input
            className="field"
            value={domainDraft}
            onChange={(event) => onDomainDraft(event.target.value)}
            placeholder="bank.example"
            autoComplete="off"
            aria-label="Website to skip"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onAddDomain()
              }
            }}
          />
          <button
            type="button"
            className="ghost compact"
            disabled={!domainDraft.trim()}
            onClick={() => onAddDomain()}
          >
            Add
          </button>
        </div>
        {canExcludeTab ? (
          <button type="button" className="quiet" onClick={() => onAddDomain(tabHost)}>
            Skip {tabHost}
          </button>
        ) : null}
        {status.excludedDomains.length ? (
          <ul className="chips">
            {status.excludedDomains.map((domain) => (
              <li key={domain}>
                <code>{domain}</code>
                <button type="button" aria-label={`Remove ${domain}`} onClick={() => onRemoveDomain(domain)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {status.licenseRequired || showLicense ? (
        <section className="panel" id="license">
          <p>
            {status.entitlement.state === 'PRO'
              ? 'Your Pro license is active.'
              : 'Paste your Pro license key for unlimited translation.'}
          </p>
          <input
            className="field"
            value={licenseInput}
            onChange={(event) => onLicenseInput(event.target.value)}
            placeholder="License key"
            autoComplete="off"
            aria-label="License key"
          />
          <button
            type="button"
            className="primary"
            disabled={busy || !licenseInput.trim()}
            onClick={onActivate}
          >
            {busy ? 'Saving…' : 'Activate'}
          </button>
          {message ? <p className={message.includes('saved') ? 'flash' : 'error'}>{message}</p> : null}
        </section>
      ) : null}

      <button type="button" className="quiet" onClick={onPlayground}>
        Open playground
      </button>
    </details>
  )
}

export function friendlyActivateMessage(result: ActivateLicenseResult): string {
  if (result.ok) return 'License saved.'
  if (result.error === 'network') return 'Something went wrong. Please try again.'
  return 'That license key didn’t work. Check it and try again.'
}
