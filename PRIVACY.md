# Privacy Policy

This document describes what the **current implementation** does. It does not claim a privacy program or a legal review.

## What is sent

When the user triggers shortcut translation, or live mode translates a completed sentence, the extension sends:

- source language
- target language
- the selected text or current writing segment
- optional license key
- `context.mode` (`writing`, `shortcut`, or `live`)

to the configured FastAPI origin. FastAPI forwards the text to Groq.

## What is not sent

Protected contexts are a no-op. The extension does not send, log, or cache:

- password, OTP, PIN, CVV, payment, username, email, or URL fields
- file inputs, hidden inputs, code editors, consoles
- tokens that look like JWT, API keys, cards, or private keys

Uncertain fields no-op.

## Storage

User translation text is **not** written to `chrome.storage` and **not** persisted in a database.

The service worker may keep a short-lived in-memory hash → translation map. It is process memory only.

Profile, usage, and license metadata are stored under `lingo*` keys. They do not include field contents.

## Logs

Backend access logs record request id, path, status, latency, language pair, character count, model, and error category. They are written **not** to include the source text. Unit tests assert a known secret string does not appear in captured logs.

Groq's own retention is outside this repository. This project does not control Groq logs.

## Analytics

No analytics SDK is shipped. Do not add one that records field text.

## Default

Do not persist user translation text. Do not log user text. Do not store translation content in analytics.

---

**Legal Review Required**: This privacy policy requires legal review before public launch. The current implementation is described accurately, but legal compliance requirements may vary by jurisdiction.
