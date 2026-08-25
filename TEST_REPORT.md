# Test Report

Date: 2026-08-23  
Project: `ai-writing-translator`  
This report lists executed evidence only. Items without evidence are marked **NOT VERIFIED**.

## Executed

| Suite | Command | Result |
| --- | --- | --- |
| Vitest | `npm test` | 15 files, 62 tests passed |
| Lint | `npm run lint` | Pass (1 Fast Refresh warning in `SettingsPanel.tsx`) |
| Typecheck | `npx tsc -b` | Pass |
| Pytest | `backend/.venv/bin/python -m pytest -q` | 16 passed |
| Chrome build | `npm run build:chrome` | Pass → `dist/chrome` |
| Edge build | `npm run build:edge` | Pass → `dist/edge` |
| Secret scan of production JS (no maps) | `rg GROQ_API_KEY\|gsk_\|LEMON_SQUEEZY_API_KEY dist` | **NOT FOUND** |

## Unit coverage that exists

- `TranslationEngine` language-pair fixtures (ar↔en, tr↔en, fr↔en, es↔en) via a mock provider
- Mixed-language targeting, URL/email non-protection of surrounding prose, secret-looking tokens
- Live segment boundaries (no per-word requests)
- Stale ticket discard
- In-memory cache TTL / size
- Shortcut selection vs current context
- Protected fields and secret selections never call the provider
- API failure leaves original text
- DOM replace for input, textarea, contenteditable, React-style input events
- Entitlement isolation keys + trial / free deny / Pro
- Command registration (`TRANSLATE_CURRENT_TEXT`, not `FIX_CURRENT_TEXT`)
- Chrome / Edge build targets
- Product identity / storage isolation
- FastAPI health, validation, fake-provider translate, malformed/empty 502, wrong product license, log redaction

## NOT VERIFIED

- Live Groq quality for every listed language pair (no live provider call was executed in this session)
- Real Chrome or Edge unpacked-extension session on a live website
- Real keyboard shortcut in Chrome or Edge
- Real React / Vue site beyond the native-setter unit test
- Google Docs / Notion / Slack custom editors (same out-of-scope as Autofix)
- Production Lemon Squeezy activation for `AI_WRITING_TRANSLATOR`
- Store listing / icon review
- Rapid typing on a real page (unit timing only)
- Network latency on a real page (unit stale-safety only)

## Isolation

- `autofix-layout` was not written to during this work.
- That repo currently has no committed baseline (`git diff` empty; all files already untracked before this task).
- New project storage keys are `translator*`.
- New license product id is `AI_WRITING_TRANSLATOR`.
- New command is `TRANSLATE_CURRENT_TEXT`.
- New default API port is `8004`.
