# Lingo API

FastAPI translation service for the browser extension. Groq stays on the server. The extension never receives `GROQ_API_KEY`.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Put your Groq key in `.env` as `GROQ_API_KEY`. Never commit `.env`.

`DEV_SKIP_LICENSE=true` is local-only.

Default model is `openai/gpt-oss-120b` via `TRANSLATION_MODEL`. This is a starting model, not a claimed optimum. Groq retired `llama-3.3-70b-versatile` on 2026-08-16.

## Run

The extension default is `http://127.0.0.1:8004`.

```bash
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8004
```

`POST /api/translate` accepts:

```json
{
  "license_key": "optional-in-dev",
  "source_language": "ar",
  "target_language": "en",
  "text": "مرحبا، كيف حالك؟",
  "context": { "mode": "writing" }
}
```

Response:

```json
{
  "translation": "Hello, how are you?",
  "source_language": "ar",
  "target_language": "en"
}
```

`GET /health` is a liveness probe.  
`GET /api/health` lists supported languages and the configured model.  
`POST /api/license/activate` validates a Lemon Squeezy key for product `AI_WRITING_TRANSLATOR`.
