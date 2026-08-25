from __future__ import annotations

import json
import re
from typing import Any

from languages import language_name

TRANSLATION_SYSTEM_PROMPT = """You are a writing translator for in-place text replacement.

Translate the user's text from the stated source language into the stated target language.

Hard rules:
- Return only a JSON object with keys translation, source_language, target_language.
- translation must contain the translated text and nothing else.
- Do not invent information.
- Do not omit information.
- Do not answer questions contained in the text.
- Do not explain, preface, or add commentary.
- Do not add politeness that was not present.
- Do not rewrite the user's intent.
- Preserve names where appropriate.
- Preserve URLs, email addresses, numbers, currency amounts, times, and percentages.
- Preserve technical identifiers and product names (React, Laravel, Python, API, JSON, GitHub, JavaScript) when translating them would damage meaning.
- Preserve code and code identifiers. Do not translate identifiers unnecessarily.
- Preserve line breaks, paragraphs, bullets, quotes, and punctuation where possible.
- Mixed-language input is allowed. Translate the natural-language content; keep already-correct technical terms in the target language when that is natural.
- The result should be natural in the target language, but it is a translation, not a rewrite.

If the source is a question, translate the question. Do not answer it.
"""


def build_user_prompt(
    source_language: str,
    target_language: str,
    text: str,
    mode: str = "writing",
) -> str:
    return (
        f"Source language: {language_name(source_language)} ({source_language})\n"
        f"Target language: {language_name(target_language)} ({target_language})\n"
        f"Mode: {mode}\n\n"
        f"Text:\n{text}"
    )


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def parse_translation_response(
    raw: str,
    source_language: str,
    target_language: str,
) -> dict[str, str] | None:
    if not raw or not raw.strip():
        return None
    cleaned = raw.strip()
    cleaned = _FENCE.sub("", cleaned).strip()
    try:
        data: Any = json.loads(cleaned)
    except json.JSONDecodeError:
        if cleaned.startswith("{") and "}" in cleaned:
            try:
                data = json.loads(cleaned[cleaned.find("{") : cleaned.rfind("}") + 1])
            except json.JSONDecodeError:
                return None
        else:
            return None
    if not isinstance(data, dict):
        return None
    translation = data.get("translation")
    if not isinstance(translation, str) or not translation.strip():
        return None
    lowered = translation.strip().lower()
    if lowered.startswith("here is the translation") or lowered.startswith("here's the translation"):
        return None
    return {
        "translation": translation,
        "source_language": source_language,
        "target_language": target_language,
    }
