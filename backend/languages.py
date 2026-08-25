from __future__ import annotations

SUPPORTED_LANGUAGES: dict[str, str] = {
    "en": "English",
    "ar": "Arabic",
    "tr": "Turkish",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "it": "Italian",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
}

LANGUAGE_CODES = frozenset(SUPPORTED_LANGUAGES)


def is_supported_language(value: str) -> bool:
    return value in LANGUAGE_CODES


def language_name(code: str) -> str:
    return SUPPORTED_LANGUAGES.get(code, code)


def public_languages() -> list[dict[str, str]]:
    return [{"code": code, "name": name} for code, name in SUPPORTED_LANGUAGES.items()]
