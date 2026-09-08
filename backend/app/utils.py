"""Meeting-ID generation and display formatting.

Deliberately free of top-level SQLAlchemy imports so `schemas.py` can reuse
`format_meeting_id` without dragging the storage layer into the API contract.
"""

from __future__ import annotations

import random
import secrets
import string
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:  # pragma: no cover - typing only
    from sqlalchemy.orm import Session

MEETING_ID_LENGTH = 11
_MAX_ID_ATTEMPTS = 25


def utcnow() -> datetime:
    """Naive UTC timestamp — SQLite has no tz-aware storage, so we normalise here."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def as_naive_utc(value: datetime) -> datetime:
    """Accept either tz-aware or naive input and store it as naive UTC."""
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def generate_meeting_id(db: "Session") -> str:
    """Random 11-digit ID that doesn't collide with an existing meeting."""
    from .models import Meeting  # local import keeps this module storage-agnostic

    for _ in range(_MAX_ID_ATTEMPTS):
        # First digit is 1-9 so the ID never renders with a leading zero.
        candidate = str(random.randint(1, 9)) + "".join(
            random.choices(string.digits, k=MEETING_ID_LENGTH - 1)
        )
        exists = db.query(Meeting.id).filter(Meeting.meeting_id == candidate).first()
        if exists is None:
            return candidate
    raise RuntimeError("Could not allocate a unique meeting ID")


def generate_passcode(length: int = 6) -> str:
    """Zoom-style short alphanumeric passcode."""
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def format_meeting_id(mid: str) -> str:
    """Group digits for display: 3-4-rest, e.g. "541 6806 191"."""
    digits = "".join(ch for ch in str(mid) if ch.isdigit())
    if len(digits) <= 3:
        return digits
    if len(digits) <= 7:
        return f"{digits[:3]} {digits[3:]}"
    return f"{digits[:3]} {digits[3:7]} {digits[7:]}"


def invite_link(meeting_id: str, frontend_url: str) -> str:
    return f"{frontend_url.rstrip('/')}/j/{meeting_id}"
