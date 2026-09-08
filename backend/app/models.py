"""SQLAlchemy 2.0 models: User, Meeting, Participant."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class MeetingStatus(str, enum.Enum):
    scheduled = "scheduled"
    live = "live"
    ended = "ended"


# Stored as VARCHAR with a CHECK constraint rather than a native DB enum so
# adding a status later doesn't need a migration on Postgres.
MeetingStatusType = Enum(
    MeetingStatus,
    native_enum=False,
    length=16,
    values_callable=lambda e: [m.value for m in e],
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    avatar_initial: Mapped[str] = mapped_column(String(2), nullable=False, default="U")
    personal_meeting_id: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(64), nullable=False, default="Workplace Basic")

    meetings: Mapped[list["Meeting"]] = relationship(
        back_populates="host",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<User {self.id} {self.email}>"


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # The 11-digit ID users type / share. Distinct from the surrogate PK.
    meeting_id: Mapped[str] = mapped_column(String(11), unique=True, nullable=False, index=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # NULL for instant meetings — they start the moment they're created.
    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False, default=40)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="Asia/Kolkata")

    passcode: Mapped[str] = mapped_column(String(16), nullable=False)
    is_instant: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_personal_room: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[MeetingStatus] = mapped_column(
        MeetingStatusType, nullable=False, default=MeetingStatus.scheduled
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    host: Mapped["User"] = relationship(back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="Participant.joined_at",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Meeting {self.meeting_id} {self.status.value}>"


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # NULL for guests who joined by link without an account.
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_host: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_muted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    video_on: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    joined_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    left_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    meeting: Mapped["Meeting"] = relationship(back_populates="participants")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Participant {self.id} {self.display_name}>"
