"""FastAPI application: CORS, table creation, seeding, router mounting."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import schemas
from .database import Base, engine, get_db
from .models import User  # noqa: F401  (import registers tables on Base.metadata)
from .routers import meetings, participants
from .seed import get_default_user, seed_if_empty

# Reads a local .env if present. On a hosting platform the variables are
# already in the process environment before Python starts, so this is a no-op
# there — but it must run before any os.getenv() call below.
load_dotenv()

API_PREFIX = "/api"

LOCAL_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Vercel mints a fresh hostname for every preview deployment, so an
# exact-match list is always one deploy behind. This covers those without
# opening the API to arbitrary origins.
VERCEL_PREVIEW_REGEX = r"https://.*\.vercel\.app"


def _allowed_origins() -> list[str]:
    """Exact-match origins for CORS.

    Accepts `FRONTEND_URL` and an optional comma-separated `EXTRA_ORIGINS`.
    Trailing slashes are stripped: a browser's `Origin` header never carries
    one, and CORS matching is an exact string comparison, so
    "https://example.com/" would silently never match.
    """
    origins = list(LOCAL_ORIGINS)

    for raw in (os.getenv("FRONTEND_URL"), os.getenv("EXTRA_ORIGINS")):
        if not raw:
            continue
        for entry in raw.split(","):
            origin = entry.strip().rstrip("/")
            if origin:
                origins.append(origin)

    # dict.fromkeys deduplicates while preserving insertion order.
    return list(dict.fromkeys(origins))


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    seed_if_empty()

    # Surfaced in the platform's logs so the resolved list can be confirmed
    # without hitting an endpoint. flush=True because stdout is block-buffered
    # when it is not a TTY, which would otherwise delay or swallow this.
    print(f"[startup] CORS allow_origins: {_allowed_origins()}", flush=True)
    print(f"[startup] CORS allow_origin_regex: {VERCEL_PREVIEW_REGEX}", flush=True)

    yield


app = FastAPI(
    title="Zoom Clone API",
    version="1.0.0",
    description="Meetings, participants and the single default user.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_origin_regex=VERCEL_PREVIEW_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, prefix=API_PREFIX)
app.include_router(participants.router, prefix=API_PREFIX)


@app.get(f"{API_PREFIX}/me", response_model=schemas.UserOut, tags=["users"])
def read_me(db: Session = Depends(get_db)) -> User:
    """No auth in this assignment: the seeded user stands in for the session."""
    return get_default_user(db)


@app.get(f"{API_PREFIX}/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
