# Lingo — Architecture

**Product:** Lingo (working name; rename in `src/brand.ts`)  
**Type:** SaaS Chromium extension (Chrome and Microsoft Edge) + FastAPI microservice  
**Role:** In-place writing translation  
**Source architecture:** infrastructure patterns from `autofix-layout`, not its keyboard-layout engine.

This document is the source of truth for *this* repository. **Implemented** means code and tests exist. **NOT VERIFIED** is stated where evidence is missing.

---

## 1. System Overview

```text
Browser extension (DOM + settings)
        ↓  POST /api/translate
FastAPI
        ↓  TranslationProvider
GroqTranslationProvider
        ↓
Groq
```

The content script is DOM-only. The service worker owns network, license, and usage. Groq credentials never enter the extension.

A **language** (`ar`, `en`) is a writing language. It is not a keyboard layout.

---

## 2. Separation from Autofix Layout

| Concern | Autofix Layout | This product |
| --- | --- | --- |
| Engine | `mapLayout` / classifier | `TranslationEngine` |
| Command | `FIX_CURRENT_TEXT` | `TRANSLATE_CURRENT_TEXT` |
| Storage | `autofix*` | `translator*` |
| Product ID | Layfix / Autofix | `AI_WRITING_TRANSLATOR` |
| Usage key | `autofixUsage` | `translatorUsage` |
| API | `/api/analyze-word` | `/api/translate` |
| Default port | 8003 | 8004 |

Shared *ideas* reused: Manifest V3 shell, content-script / service-worker split, snapshot DOM writes, protected-field probes, entitlement engine shape, Chrome/Edge Vite targets.

Not copied: layout tables, `CHECK_WORD`, speed box, manual layout converter, persistent word cache.

---

## 3. Repository Structure

```text
ai-writing-translator/
├── ARCHITECTURE.md
├── README.md
├── SECURITY.md
├── PRIVACY.md
├── TRANSLATION_ENGINE.md
├── TEST_REPORT.md
├── manifest.json
├── src/
│   ├── brand.ts                 product identity
│   ├── languages.ts             MVP language registry
│   ├── content_script.ts        DOM + shortcut + live scheduler
│   ├── background.ts            API, license, profile, usage
│   ├── messaging.ts
│   ├── translation/             TranslationEngine + stale/segments/cache
│   ├── content/translateCurrentText.ts
│   ├── safety/                  protected fields / tokens / domains
│   ├── dom/                     snapshot read/write/verify
│   ├── entitlement/             trial / free / pro (translator keys)
│   ├── profile/                 languages + toggles
│   ├── popup/                   dedicated translator UI
│   └── ui/
├── backend/
│   ├── main.py                  /api/translate + license + health
│   ├── translation.py           prompt + JSON parse
│   ├── providers/               TranslationProvider / Groq
│   ├── languages.py
│   ├── settings.py
│   ├── ratelimit.py
│   └── observability.py
├── dist/chrome/
└── dist/edge/
```

---

## 4. Data Flow

```text
Shortcut:
  Commands API → service worker (no field text)
    → TRANSLATE_CURRENT_TEXT → content script
    → focused field → selection or current paragraph
    → TRANSLATE_TEXT → FastAPI → Groq
    → stale check → surgical DOM replace

Live:
  input / Enter → 750ms pause → completed sentence only
    → same API and stale checks
    → typing path never awaits the network
```

---

## 5. API

`POST /api/translate`

```json
{
  "license_key": "optional-in-dev",
  "source_language": "ar",
  "target_language": "en",
  "text": "مرحبا، كيف حالك؟",
  "context": { "mode": "writing" }
}
```

```json
{
  "translation": "Hello, how are you?",
  "source_language": "ar",
  "target_language": "en"
}
```

`GET /health` — `{ "status": "ok" }`  
`GET /api/health` — model, product id, languages  
`POST /api/license/activate` — Lemon Squeezy validate; rejects `product_id` other than `AI_WRITING_TRANSLATOR`

Extension default API base: `VITE_API_BASE_URL` or `http://127.0.0.1:8004`.

---

## 6. Storage

| Key | Area | Contents |
| --- | --- | --- |
| `translatorProfile` | local | languages, shortcut/live toggles, exclusions, pause |
| `translatorUsage` | local | usage balance + `canIntervene` |
| `translatorLicenseCache` | local | last server-verified license |
| `translatorLicenseKey` | sync | user license only |
| `translatorFirstActivatedAt` | sync | trial start |

No persistent translation-text cache. In-memory cache in the service worker is short-lived and keyed by a hash.

---

## 7. Permissions

- `storage` — profile, usage, license cache
- `activeTab` — shortcut dispatch to the focused tab
- Hosts: `http://127.0.0.1:8004/*`, `http://localhost:8004/*`, plus `VITE_API_BASE_URL` origin at build time

`clipboardWrite` is not requested. Content script matches `<all_urls>` so the user can write on normal sites; protected fields still no-op.

---

## 8. Tech stack

| Layer | Choice |
| --- | --- |
| Extension | TypeScript, React popup, Vite, `@crxjs/vite-plugin`, MV3 |
| Backend | FastAPI, AsyncGroq, `TranslationProvider` |
| Tests | Vitest, pytest |

```bash
npm test
npm run build:chrome
npm run build:edge
cd backend && python3 -m pytest
```
