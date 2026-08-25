/** Monetization knobs. Isolated from Autofix storage and product IDs. */

export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000
export const FREE_DAILY_ALLOWANCE_SECONDS = 2 * 60 * 60
export const FREE_MAX_BALANCE_MS = FREE_DAILY_ALLOWANCE_SECONDS * 1000
export const REFILL_INTERVAL_MS = 5 * 60 * 60 * 1000
export const REFILL_AMOUNT_MS = 30 * 60 * 1000
export const ACTIVE_IDLE_TIMEOUT_MS = 60 * 1000
export const ACTIVITY_HEARTBEAT_MS = 5 * 1000
export const LICENSE_CACHE_TTL_MS = 900 * 1000
export const CLOCK_BACKWARD_TOLERANCE_MS = 5 * 60 * 1000
export const USAGE_STORAGE_KEY = 'lingoUsage'
export const TRIAL_SYNC_KEY = 'lingoFirstActivatedAt'
export const LICENSE_CACHE_STORAGE_KEY = 'lingoLicenseCache'
export const LICENSE_KEY_STORAGE_KEY = 'lingoLicenseKey'
export const USAGE_STATE_VERSION = 1
export const PRO_CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || ''
