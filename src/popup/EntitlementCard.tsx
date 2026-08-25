import { PRO_CHECKOUT_URL, formatDuration, formatTrialRemaining } from '../entitlement/index.ts'
import { BRAND } from '../brand.ts'
import type { EntitlementView } from '../entitlement/types.ts'
import { FIRST_MONTH_FREE, PRO_PRICE_LABEL } from '../pricing.ts'

type Props = {
  entitlement: EntitlementView
  onUpgrade: () => void
}

export function EntitlementCard({ entitlement, onUpgrade }: Props) {
  function upgrade(): void {
    if (PRO_CHECKOUT_URL) void chrome.tabs.create({ url: PRO_CHECKOUT_URL })
    onUpgrade()
  }

  if (entitlement.state === 'TRIAL') {
    return (
      <section className="plan">
        <p className="plan-title">7-day full access</p>
        {entitlement.trialRemainingMs != null ? (
          <p className="plan-meta">{formatTrialRemaining(entitlement.trialRemainingMs)}</p>
        ) : null}
      </section>
    )
  }

  if (entitlement.state === 'PRO') {
    return (
      <section className="plan">
        <p className="plan-title">Pro</p>
        <p className="plan-meta">Unlimited translation</p>
      </section>
    )
  }

  return (
    <section className={`plan ${entitlement.limitReached ? 'pro-card' : ''}`}>
      {entitlement.limitReached ? (
        <>
          <p className="plan-title">Translation is paused</p>
          <p className="plan-meta">
            Your free usage will refill automatically.
            {entitlement.nextRefillInMs != null
              ? ` Next refill in ${formatDuration(entitlement.nextRefillInMs)}.`
              : ''}
          </p>
        </>
      ) : (
        <>
          <p className="plan-title">Free</p>
          <p className="plan-meta">
            {formatDuration(entitlement.remainingMs)} remaining
            {entitlement.nextRefillInMs != null
              ? ` · Next refill in ${formatDuration(entitlement.nextRefillInMs)}`
              : ''}
          </p>
        </>
      )}
      <div className="pro-offer">
        <p className="plan-title">{BRAND.name} Pro</p>
        <p className="plan-meta">Unlimited in-place translation.</p>
        {FIRST_MONTH_FREE && (
          <p className="plan-meta first-month-free">First month free</p>
        )}
        <p className="plan-meta">{PRO_PRICE_LABEL}</p>
        <button type="button" className="primary compact" onClick={upgrade}>
          Upgrade to Pro
        </button>
      </div>
    </section>
  )
}
