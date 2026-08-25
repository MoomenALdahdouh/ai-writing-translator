from __future__ import annotations

from groq import AsyncGroq

from settings import TRANSLATION_MODEL
from translation import TRANSLATION_SYSTEM_PROMPT, build_user_prompt


class GroqTranslationProvider:
    def __init__(self, client: AsyncGroq, model: str = TRANSLATION_MODEL) -> None:
        self._client = client
        self._model = model

    @property
    def model(self) -> str:
        return self._model

    async def translate(
        self,
        *,
        source_language: str,
        target_language: str,
        text: str,
        mode: str,
    ) -> str:
        completion = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": TRANSLATION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_user_prompt(source_language, target_language, text, mode),
                },
            ],
            temperature=0,
            max_tokens=2048,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"},
        )
        message = completion.choices[0].message.content if completion.choices else None
        return str(message or "")
