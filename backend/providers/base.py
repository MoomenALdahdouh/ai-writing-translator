from __future__ import annotations

from typing import Protocol


class TranslationProvider(Protocol):
    async def translate(
        self,
        *,
        source_language: str,
        target_language: str,
        text: str,
        mode: str,
    ) -> str:
        """Return raw model text. Must not log the user text."""
