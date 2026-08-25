# Lingo

Chromium extension (Chrome and Microsoft Edge) + FastAPI service that translates text **in the field you are already writing in**.

It is not a keyboard-layout fixer. The sibling product `autofix-layout` remaps mistyped keys. This product translates meaning.

```text
Write:     مرحبا، أريد معرفة المزيد عن هذا المنتج.
Shortcut:  Ctrl/⌘+Shift+,
Result:    Hello, I would like to know more about this product.
```

Working internal name: `lingo`. Public branding is configurable in `src/brand.ts`.

## Implemented

- Explicit source and target language selectors, plus swap
- Translate on shortcut (`TRANSLATE_CURRENT_TEXT`)
- Selection-first replacement; otherwise current paragraph / field
- Live translation of completed sentences after a pause (off by default)
- Groq accessed only through FastAPI (`POST /api/translate`)
- Protected fields are never sent to the server
- Isolated storage, license, and usage keys (`lingo*`)
- Chrome and Edge builds from one source tree

## Not claimed

Language-pair quality is covered by fixture and parser tests. Live Groq quality for every listed language is **NOT VERIFIED** until you run the backend against real pages.

## Extension

```bash
npm install
npm test
npm run lint
npm run build:chrome   # dist/chrome
npm run build:edge     # dist/edge
```

Chrome: load `dist/chrome` in `chrome://extensions` (Developer mode → Load unpacked).  
Edge: load `dist/edge` in `edge://extensions`.

Local API default: `http://127.0.0.1:8004`.

## Backend

See [`backend/README.md`](backend/README.md).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set GROQ_API_KEY in .env — never in the extension
uvicorn main:app --host 127.0.0.1 --port 8004
```

## Docs

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`TRANSLATION_ENGINE.md`](TRANSLATION_ENGINE.md)
- [`SECURITY.md`](SECURITY.md)
- [`PRIVACY.md`](PRIVACY.md)
- [`TEST_REPORT.md`](TEST_REPORT.md)
