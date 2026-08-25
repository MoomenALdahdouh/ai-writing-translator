from __future__ import annotations

import hashlib
import logging
from contextlib import asynccontextmanager
from typing import Literal

import httpx
from cachetools import TTLCache
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from groq import AsyncGroq
from pydantic import BaseModel, ConfigDict, Field, field_validator
from starlette.exceptions import HTTPException as StarletteHTTPException

from languages import is_supported_language, public_languages
from observability import RequestContextMiddleware, apply_security_headers, client_ip
from providers.groq_provider import GroqTranslationProvider
from ratelimit import SlidingWindowLimiter
from settings import (
    CORS_ALLOW_ORIGINS,
    DEV_SKIP_LICENSE,
    EXTENSION_ORIGIN_REGEX,
    FIRST_MONTH_FREE,
    GROQ_MAX_RETRIES,
    GROQ_TIMEOUT_SECONDS,
    INVALID_LICENSE_TTL_SECONDS,
    LEMON_SQUEEZY_API_KEY,
    LICENSE_MODE,
    LICENSE_TTL_SECONDS,
    MAX_GROQ_RESPONSE_CHARS,
    MAX_TEXT_CHARS,
    PRODUCT_ID,
    RATE_LIMIT_LICENSE_PER_MINUTE,
    RATE_LIMIT_TRANSLATE_PER_MINUTE,
    RATE_LIMIT_WINDOW_SECONDS,
    TRANSLATION_MODEL,
    TRANSLATION_PROMPT_VERSION,
    assert_production_safe,
    is_production,
    public_error_detail,
    require_groq_api_key,
)
from translation import parse_translation_response
from webhooks import (
    get_customer_email,
    get_event_meta,
    get_subscription_status,
    get_variant_id,
    is_subscription_event,
    parse_webhook_event,
)

logger = logging.getLogger("translator")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


class TranslateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    license_key: str | None = Field(default=None, max_length=128)
    source_language: str = Field(..., min_length=2, max_length=8)
    target_language: str = Field(..., min_length=2, max_length=8)
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_CHARS)
    context: dict[str, str] | None = None

    @field_validator("source_language", "target_language")
    @classmethod
    def normalize_language(cls, value: str) -> str:
        code = value.strip().lower()
        if not is_supported_language(code):
            raise ValueError("unsupported_language")
        return code

    @field_validator("text")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        text = value.replace("\x00", "")
        if not text.strip():
            raise ValueError("text must not be empty")
        return text

    @field_validator("license_key")
    @classmethod
    def normalize_license(cls, value: str | None) -> str | None:
        if value is None:
            return None
        key = value.strip()
        return key or None


class TranslateResponse(BaseModel):
    translation: str
    source_language: str
    target_language: str


class ActivateLicenseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    license_key: str = Field(..., min_length=1, max_length=128)
    product_id: str | None = Field(default=None, max_length=64)


class ActivateLicenseResponse(BaseModel):
    valid: bool
    status: str
    license_required: bool
    product_id: str


class HealthResponse(BaseModel):
    ok: bool
    model: str
    product_id: str
    license_required: bool
    languages: list[dict[str, str]]
    prompt_version: str
    first_month_free: bool


class LivenessResponse(BaseModel):
    status: Literal["ok"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    assert_production_safe()
    groq = AsyncGroq(
        api_key=require_groq_api_key(),
        timeout=GROQ_TIMEOUT_SECONDS,
        max_retries=GROQ_MAX_RETRIES,
    )
    app.state.groq = groq
    app.state.provider = GroqTranslationProvider(groq, TRANSLATION_MODEL)
    app.state.http = httpx.AsyncClient(timeout=5.0)
    app.state.valid_licenses = TTLCache(maxsize=2_000, ttl=LICENSE_TTL_SECONDS)
    app.state.invalid_licenses = TTLCache(
        maxsize=2_000,
        ttl=INVALID_LICENSE_TTL_SECONDS,
    )
    app.state.limiter = SlidingWindowLimiter()
    try:
        yield
    finally:
        await app.state.groq.close()
        await app.state.http.aclose()


app = FastAPI(
    title="Lingo API",
    lifespan=lifespan,
    docs_url=None if is_production() else "/docs",
    redoc_url=None if is_production() else "/redoc",
    openapi_url=None if is_production() else "/openapi.json",
)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_origin_regex=None if CORS_ALLOW_ORIGINS == ["*"] else EXTENSION_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID", "Retry-After"],
)


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "-")


def _json_error(request: Request, status: int, detail: object, headers: dict[str, str] | None = None) -> JSONResponse:
    merged = dict(headers or {})
    merged["X-Request-ID"] = _request_id(request)
    response = JSONResponse(
        status_code=status,
        content={"detail": public_error_detail(detail)},
        headers=merged,
    )
    apply_security_headers(response)
    return response


@app.exception_handler(RequestValidationError)
async def invalid_request_handler(request: Request, _exc: RequestValidationError) -> JSONResponse:
    return _json_error(request, 422, "invalid_request")


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _json_error(request, exc.status_code, exc.detail, dict(exc.headers or {}))


def _license_hash(license_key: str) -> str:
    return hashlib.sha256(license_key.encode("utf-8")).hexdigest()


def _enforce_rate_limit(request: Request, bucket: str) -> None:
    limiter: SlidingWindowLimiter = request.app.state.limiter
    limit = (
        RATE_LIMIT_TRANSLATE_PER_MINUTE
        if bucket == "translate"
        else RATE_LIMIT_LICENSE_PER_MINUTE
    )
    allowed, retry_after = limiter.check(
        f"{bucket}:{client_ip(request)}",
        limit,
        RATE_LIMIT_WINDOW_SECONDS,
    )
    if allowed:
        return
    logger.info(
        "rid=%s path=%s rate_limited=1",
        _request_id(request),
        request.url.path,
    )
    raise HTTPException(
        status_code=429,
        detail="rate_limited",
        headers={"Retry-After": str(retry_after)},
    )


async def _lemon_validate(license_key: str) -> tuple[bool, str]:
    if not LEMON_SQUEEZY_API_KEY:
        return False, "lemon_squeezy_unconfigured"

    response = await app.state.http.post(
        "https://api.lemonsqueezy.com/v1/licenses/validate",
        headers={
            "Authorization": f"Bearer {LEMON_SQUEEZY_API_KEY}",
            "Accept": "application/json",
        },
        json={"license_key": license_key},
    )
    data = response.json()
    valid = bool(data.get("valid"))
    status = str((data.get("license_key") or {}).get("status") or data.get("error") or "unknown")
    if status and not status.replace("_", "").replace("-", "").isalnum():
        status = "unknown"
    return valid, status[:40]


async def _ensure_license(request: Request, license_key: str | None) -> str:
    if LICENSE_MODE == "dev":
        return "dev"
    if LICENSE_MODE == "unconfigured":
        raise HTTPException(status_code=503, detail="license_unconfigured")

    if not license_key:
        raise HTTPException(status_code=403, detail="license_invalid")

    digest = _license_hash(license_key)
    if digest in app.state.valid_licenses:
        logger.info("rid=%s license_cache=valid", _request_id(request))
        return str(app.state.valid_licenses[digest])
    if digest in app.state.invalid_licenses:
        logger.info("rid=%s license_cache=invalid", _request_id(request))
        raise HTTPException(status_code=403, detail="license_invalid")

    try:
        valid, status = await _lemon_validate(license_key)
    except Exception as exc:
        logger.error(
            "rid=%s lemon_validate_failed=%s",
            _request_id(request),
            type(exc).__name__,
        )
        raise HTTPException(status_code=502, detail="license_upstream") from exc

    if not valid:
        app.state.invalid_licenses[digest] = status
        logger.info("rid=%s license_result=invalid", _request_id(request))
        raise HTTPException(status_code=403, detail="license_invalid")

    app.state.valid_licenses[digest] = status
    logger.info("rid=%s license_result=valid", _request_id(request))
    return status


@app.get("/health", response_model=LivenessResponse)
async def liveness() -> LivenessResponse:
    return LivenessResponse(status="ok")


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        ok=True,
        model=TRANSLATION_MODEL,
        product_id=PRODUCT_ID,
        license_required=LICENSE_MODE != "dev",
        languages=public_languages(),
        prompt_version=TRANSLATION_PROMPT_VERSION,
        first_month_free=FIRST_MONTH_FREE,
    )


@app.post("/api/license/activate", response_model=ActivateLicenseResponse)
async def activate_license(
    payload: ActivateLicenseRequest,
    request: Request,
) -> ActivateLicenseResponse:
    _enforce_rate_limit(request, "license")
    if payload.product_id and payload.product_id != PRODUCT_ID:
        raise HTTPException(status_code=403, detail="wrong_product")
    if LICENSE_MODE == "dev":
        return ActivateLicenseResponse(
            valid=True,
            status="dev",
            license_required=False,
            product_id=PRODUCT_ID,
        )
    if LICENSE_MODE == "unconfigured":
        raise HTTPException(status_code=503, detail="license_unconfigured")

    digest = _license_hash(payload.license_key)
    app.state.invalid_licenses.pop(digest, None)

    try:
        valid, status = await _lemon_validate(payload.license_key)
    except Exception as exc:
        logger.error(
            "rid=%s lemon_activate_failed=%s",
            _request_id(request),
            type(exc).__name__,
        )
        raise HTTPException(status_code=502, detail="license_upstream") from exc

    if valid:
        app.state.valid_licenses[digest] = status
    else:
        app.state.invalid_licenses[digest] = status

    logger.info(
        "rid=%s license_activate=%s product=%s",
        _request_id(request),
        "valid" if valid else "invalid",
        PRODUCT_ID,
    )
    return ActivateLicenseResponse(
        valid=valid,
        status=status,
        license_required=True,
        product_id=PRODUCT_ID,
    )


@app.post("/api/translate", response_model=TranslateResponse)
async def translate(payload: TranslateRequest, request: Request) -> TranslateResponse:
    _enforce_rate_limit(request, "translate")
    await _ensure_license(request, payload.license_key)

    if payload.source_language == payload.target_language:
        raise HTTPException(status_code=422, detail="invalid_request")

    mode = "writing"
    if payload.context and payload.context.get("mode") in {"writing", "shortcut", "live"}:
        mode = payload.context["mode"]

    logger.info(
        "rid=%s cache=miss pair=%s-%s chars=%s mode=%s model=%s",
        _request_id(request),
        payload.source_language,
        payload.target_language,
        len(payload.text),
        mode,
        TRANSLATION_MODEL,
    )

    provider: GroqTranslationProvider = request.app.state.provider
    try:
        raw = await provider.translate(
            source_language=payload.source_language,
            target_language=payload.target_language,
            text=payload.text,
            mode=mode,
        )
    except Exception as exc:
        logger.error(
            "rid=%s groq_failed=%s",
            _request_id(request),
            type(exc).__name__,
        )
        raise HTTPException(status_code=502, detail="groq_failed") from exc

    if not raw or not raw.strip():
        raise HTTPException(status_code=502, detail="groq_failed")
    if len(raw) > MAX_GROQ_RESPONSE_CHARS:
        logger.error("rid=%s groq_failed=oversized", _request_id(request))
        raise HTTPException(status_code=502, detail="groq_failed")

    parsed = parse_translation_response(raw, payload.source_language, payload.target_language)
    if parsed is None:
        raise HTTPException(status_code=502, detail="invalid_response")

    return TranslateResponse.model_validate(parsed)


@app.post("/webhooks/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request) -> dict[str, str]:
    """Handle Lemon Squeezy webhook events."""
    event = await parse_webhook_event(request)
    event_name, subscription_id = get_event_meta(event)
    
    logger.info(
        "rid=%s webhook_event=%s subscription_id=%s",
        _request_id(request),
        event_name,
        subscription_id,
    )
    
    if not is_subscription_event(event):
        logger.info("rid=%s webhook=ignored non_subscription", _request_id(request))
        return {"status": "ignored"}
    
    status = get_subscription_status(event)
    customer_email = get_customer_email(event)
    variant_id = get_variant_id(event)
    
    logger.info(
        "rid=%s subscription_status=%s customer=%s variant=%s",
        _request_id(request),
        status,
        customer_email,
        variant_id,
    )
    
    # TODO: Implement subscription state management
    # This would update a database or cache with subscription status
    # For now, we log the event for manual verification
    
    return {"status": "processed"}
