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

load_dotenv()

API_PREFIX = "/api"


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(
    title="Zoom Clone API",
    version="1.0.0",
    description="Meetings, participants and the single default user.",
    lifespan=lifespan,
)


def _allowed_origins() -> list[str]:
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        candidate = frontend_url.rstrip("/")
        if candidate not in origins:
            origins.append(candidate)
    return origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
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
