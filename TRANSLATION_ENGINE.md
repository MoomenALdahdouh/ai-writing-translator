# Translation Engine

The product engine is `TranslationEngine`. It is independent of Autofix `mapLayout`.

```text
TranslationEngine
      ↓
TranslationProvider
      ↓
GroqTranslationProvider  (server only)
```

## Request

```ts
{
  sourceLanguage: 'ar',
  targetLanguage: 'en',
  text: 'مرحبا، كيف حالك؟',
  mode: 'shortcut' | 'live'
}
```

The engine rejects empty text, same-language pairs, and payloads over 4 000 characters **before** any network call.

## Provider

The browser never imports Groq. `src/background.ts` calls FastAPI. `backend/providers/groq_provider.py` is the only Groq client.

Model: `TRANSLATION_MODEL` (default `openai/gpt-oss-120b`). This is a starting configuration, not a claimed optimum. Groq retired `llama-3.3-70b-versatile` on 2026-08-16.

## Prompt rules

See `backend/translation.py`. The model must:

- translate only
- preserve meaning
- not answer questions in the source
- not explain
- preserve URLs, emails, numbers, names, code, and formatting where possible

## Modes

**Shortcut.** One request per command. Selection wins. Otherwise the current paragraph / field.

**Live.** Completed sentence after punctuation, Enter, or a 750 ms pause. Never one request per word. The keydown/input handlers do not await translation.

## Stale safety

Every in-flight result is tied to generation, original slice, range, and language pair. If the user edits that slice, the result is discarded.

## Cache

Short-lived in-memory only. Not written to `chrome.storage`. Access logs record request id, pair, character count, status, and latency — not the source text.
