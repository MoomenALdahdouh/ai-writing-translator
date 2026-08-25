from __future__ import annotations

import logging

from fastapi.testclient import TestClient

from main import app


class _Message:
    def __init__(self, content: str) -> None:
        self.content = content


class _Choice:
    def __init__(self, content: str) -> None:
        self.message = _Message(content)


class _Completion:
    def __init__(self, content: str) -> None:
        self.choices = [_Choice(content)]


class FakeProvider:
    def __init__(self, content: str) -> None:
        self.content = content
        self.calls = 0
        self.last_text = None

    async def translate(self, **kwargs):
        self.calls += 1
        self.last_text = kwargs.get("text")
        return self.content


def _client() -> TestClient:
    return TestClient(app)


def test_liveness_health():
    with _client() as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        assert "X-Request-ID" in response.headers
        assert "groq" not in response.text.lower()


def test_api_health_lists_languages_not_layouts():
    with _client() as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True
        assert body["product_id"] == "AI_WRITING_TRANSLATOR"
        assert "layouts" not in body
        codes = {item["code"] for item in body["languages"]}
        assert {"en", "ar", "tr", "fr", "es"}.issubset(codes)


def test_translate_validation_does_not_echo_input(caplog):
    secret = "UNIQUE_PRIVACY_TOKEN_XYZ"
    caplog.set_level(logging.INFO)
    with _client() as client:
        response = client.post(
            "/api/translate",
            json={
                "source_language": "ar",
                "target_language": "en",
                "text": "",
            },
        )
        assert response.status_code == 422
        assert response.json() == {"detail": "invalid_request"}
        assert secret not in response.text
        assert secret not in caplog.text


def test_translate_success_with_fake_provider():
    fake = FakeProvider(
        '{"translation":"Hello, how are you?","source_language":"ar","target_language":"en"}'
    )
    with _client() as client:
        client.app.state.provider = fake
        response = client.post(
            "/api/translate",
            json={
                "source_language": "ar",
                "target_language": "en",
                "text": "مرحبا، كيف حالك؟",
                "context": {"mode": "writing"},
            },
        )
        assert response.status_code == 200
        assert response.json()["translation"] == "Hello, how are you?"
        assert fake.calls == 1


def test_translate_malformed_response_is_502():
    fake = FakeProvider("not-json")
    with _client() as client:
        client.app.state.provider = fake
        response = client.post(
            "/api/translate",
            json={"source_language": "en", "target_language": "ar", "text": "hello"},
        )
        assert response.status_code == 502
        assert response.json() == {"detail": "invalid_response"}


def test_translate_empty_response_is_502():
    fake = FakeProvider("   ")
    with _client() as client:
        client.app.state.provider = fake
        response = client.post(
            "/api/translate",
            json={"source_language": "en", "target_language": "fr", "text": "hello"},
        )
        assert response.status_code == 502
        assert response.json() == {"detail": "groq_failed"}


def test_translate_rejects_unsupported_language():
    with _client() as client:
        response = client.post(
            "/api/translate",
            json={"source_language": "xx", "target_language": "en", "text": "hello"},
        )
        assert response.status_code == 422


def test_wrong_product_license_is_rejected():
    with _client() as client:
        response = client.post(
            "/api/license/activate",
            json={"license_key": "abc", "product_id": "AUTOFIX_LAYOUT"},
        )
        assert response.status_code == 403
        assert response.json() == {"detail": "wrong_product"}


def test_access_log_omits_user_text(caplog):
    caplog.set_level(logging.INFO)
    fake = FakeProvider('{"translation":"Hi","source_language":"ar","target_language":"en"}')
    secret = "مرحبا كيف حالك اليوم السري"
    with _client() as client:
        client.app.state.provider = fake
        client.post(
            "/api/translate",
            json={"source_language": "ar", "target_language": "en", "text": secret},
        )
        assert secret not in caplog.text
