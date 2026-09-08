"""Idempotent seed data.

No auth in this assignment, so a single default user is treated as the
logged-in account everywhere.
"""

from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Meeting, MeetingStatus, Participant, User
from .utils import generate_passcode, utcnow

DEFAULT_USER_EMAIL = "mohvijay@example.com"
DEFAULT_PERSONAL_MEETING_ID = "54168061911"


def get_default_user(db: Session) -> User:
    """The stand-in for the authenticated user."""
    user = db.query(User).filter(User.email == DEFAULT_USER_EMAIL).first()
    if user is None:
        # Fall back to whoever exists so a wiped-and-reseeded DB still works.
        user = db.query(User).order_by(User.id).first()
    if user is None:
        raise RuntimeError("No users in the database — seeding did not run")
    return user


def _at(base: datetime, days: int, hour: int, minute: int = 0) -> datetime:
    """Helper: a day offset from `base` pinned to a specific UTC time."""
    return (base + timedelta(days=days)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )


def _ensure_future(start: datetime, now: datetime) -> datetime:
    """Push a pinned start forward in whole days until it is comfortably ahead.

    `_at` pins a UTC hour, so seeding late in the day could otherwise land an
    "upcoming" meeting in the past and leave the dashboard list empty. Shifting
    by whole days keeps the intended time-of-day intact.
    """
    while start < now + timedelta(hours=1):
        start += timedelta(days=1)
    return start


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(User.id).first() is not None:
            return  # already seeded

        now = utcnow()

        user = User(
            name="Mohvijay Jain",
            email=DEFAULT_USER_EMAIL,
            avatar_initial="M",
            personal_meeting_id=DEFAULT_PERSONAL_MEETING_ID,
            plan="Workplace Basic",
        )
        db.add(user)
        db.flush()  # assign user.id before referencing it below

        upcoming = [
            {
                "meeting_id": "83920174562",
                "topic": "Sprint 24 Planning",
                "description": "Groom the backlog and lock scope for the next two weeks.",
                "scheduled_start": _ensure_future(_at(now, 1, 4, 30), now),  # 10:00 IST
                "duration_min": 60,
            },
            {
                "meeting_id": "71204558930",
                "topic": "Design Review — Onboarding Flow",
                "description": "Walk through the revised sign-up screens with the design team.",
                "scheduled_start": _ensure_future(_at(now, 3, 9, 0), now),  # 14:30 IST
                "duration_min": 45,
            },
        ]

        recent = [
            {
                "meeting_id": "62841097335",
                "topic": "Weekly Engineering Standup",
                "description": "Status round-up across squads.",
                "days_ago": 1,
                "hour": 4,
                "duration_min": 30,
            },
            {
                "meeting_id": "50937712648",
                "topic": "Q3 Roadmap Sync",
                "description": "Prioritisation for the next quarter.",
                "days_ago": 3,
                "hour": 11,
                "duration_min": 60,
            },
            {
                "meeting_id": "94612380751",
                "topic": "1:1 with Aarav",
                "description": None,
                "days_ago": 6,
                "hour": 7,
                "duration_min": 30,
            },
        ]

        for row in upcoming:
            db.add(
                Meeting(
                    meeting_id=row["meeting_id"],
                    host_id=user.id,
                    topic=row["topic"],
                    description=row["description"],
                    scheduled_start=row["scheduled_start"],
                    duration_min=row["duration_min"],
                    timezone="Asia/Kolkata",
                    passcode=generate_passcode(),
                    is_instant=False,
                    is_personal_room=False,
                    status=MeetingStatus.scheduled,
                    created_at=now - timedelta(days=2),
                )
            )

        for row in recent:
            started = _at(now, -row["days_ago"], row["hour"])
            ended = started + timedelta(minutes=row["duration_min"])
            meeting = Meeting(
                meeting_id=row["meeting_id"],
                host_id=user.id,
                topic=row["topic"],
                description=row["description"],
                scheduled_start=started,
                duration_min=row["duration_min"],
                timezone="Asia/Kolkata",
                passcode=generate_passcode(),
                is_instant=False,
                is_personal_room=False,
                status=MeetingStatus.ended,
                created_at=started - timedelta(days=1),
                ended_at=ended,
            )
            meeting.participants.append(
                Participant(
                    user_id=user.id,
                    display_name=user.name,
                    is_host=True,
                    is_muted=False,
                    video_on=True,
                    joined_at=started,
                    left_at=ended,
                )
            )
            db.add(meeting)

        db.commit()
    finally:
        db.close()
