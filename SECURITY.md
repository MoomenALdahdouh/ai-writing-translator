# Security

## Secrets

`GROQ_API_KEY` exists only in the FastAPI process environment (`backend/.env`).

It must not appear in:

- the extension source
- `VITE_*` variables
- `dist/chrome` or `dist/edge`
- committed `.env.example` files as a real key

Lemon Squeezy keys follow the same rule.

## Trust boundary

```text
page DOM  →  content script  →  service worker  →  FastAPI  →  Groq
```

The content script does not `fetch`. Protected fields never produce a `TRANSLATE_TEXT` payload.

## Manifest V3

No remote code. No `eval`. No inline scripts. Popup and testpad are bundled by Vite.

## License isolation

Activate requests may include `product_id: "AI_WRITING_TRANSLATOR"`. A different product id is rejected (`403 wrong_product`). Autofix license keys stored under `licenseKey` / `autofix*` are not read.

## Rate limits

In-process sliding windows:

- translate: 40 / minute / IP (default)
- license: 20 / minute / IP

Over-limit returns `429 {"detail":"rate_limited"}`. The extension treats that as a no-op and leaves the user’s text intact.

## Production

`APP_ENV=production` forbids `DEV_SKIP_LICENSE=true` and `CORS_ORIGINS=*`.
