from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

from fastapi import HTTPException, Request

from settings import LEMON_SQUEEZY_API_KEY

logger = logging.getLogger("translator")


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify Lemon Squeezy webhook signature."""
    if not LEMON_SQUEEZY_API_KEY:
        logger.warning("LEMON_SQUEEZY_API_KEY not set - webhook verification disabled")
        return False
    
    secret = LEMON_SQUEEZY_API_KEY.encode()
    expected_signature = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    
    # Lemon Squeezy sends signature as "sha256=<hex>"
    if signature.startswith("sha256="):
        signature = signature[7:]
    
    return hmac.compare_digest(expected_signature, signature)


async def parse_webhook_event(request: Request) -> dict[str, Any]:
    """Parse and verify webhook event."""
    payload = await request.body()
    signature = request.headers.get("X-Signature", "")
    
    if not verify_webhook_signature(payload, signature):
        logger.warning("Invalid webhook signature")
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    try:
        import json
        event = json.loads(payload.decode())
    except Exception as e:
        logger.error(f"Failed to parse webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    
    return event


def get_event_meta(event: dict[str, Any]) -> tuple[str, str]:
    """Extract event type and ID from webhook payload."""
    meta = event.get("meta", {})
    event_name = meta.get("event_name", "unknown")
    custom_data = meta.get("custom_data", {})
    subscription_id = str(custom_data.get("subscription_id", ""))
    
    return event_name, subscription_id


def is_subscription_event(event: dict[str, Any]) -> bool:
    """Check if event is subscription-related."""
    event_name, _ = get_event_meta(event)
    subscription_events = [
        "subscription_created",
        "subscription_updated",
        "subscription_cancelled",
        "subscription_expired",
        "subscription_payment_failed",
        "subscription_payment_success",
        "subscription_payment_refunded",
    ]
    return event_name in subscription_events


def get_subscription_status(event: dict[str, Any]) -> str:
    """Extract subscription status from event."""
    data = event.get("data", {})
    attributes = data.get("attributes", {})
    status = attributes.get("status", "unknown")
    return status


def get_customer_email(event: dict[str, Any]) -> str:
    """Extract customer email from event."""
    data = event.get("data", {})
    attributes = data.get("attributes", {})
    customer_email = attributes.get("customer_email", "")
    return str(customer_email)


def get_variant_id(event: dict[str, Any]) -> str:
    """Extract variant ID from event."""
    data = event.get("data", {})
    attributes = data.get("attributes", {})
    variant_id = attributes.get("variant_id", "")
    return str(variant_id)
