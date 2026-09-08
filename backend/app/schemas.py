"""Pydantic request/response models.

No SQLAlchemy imports live here on purpose: the API contract stays decoupled
from the storage layer, so these models are trivially testable on their own.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from .utils import format_meeting_id

MeetingStatus = Literal["scheduled", "live", "ended"]
MeetingFilter = Literal["upcoming", "recent"]


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------- #
# Users
# --------------------------------------------------------------------------- #
class UserOut(ORMModel):
    id: int
    name: str
    email: str
    avatar_initial: str
    personal_meeting_id: str
    plan: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def personal_meeting_id_formatted(self) -> str:
        return format_meeting_id(self.personal_meeting_id)


# --------------------------------------------------------------------------- #
# Meetings
# --------------------------------------------------------------------------- #
class MeetingCreate(BaseModel):
    topic: str = Field(min_length=1, max_length=255)
    description: str | None = None
    scheduled_start: datetime
    duration_min: int = Field(default=40, ge=1, le=24 * 60)
    timezone: str = Field(default="Asia/Kolkata", max_length=64)


class MeetingOut(ORMModel):
    id: int
    meeting_id: str
    host_id: int
    topic: str
    description: str | None
    scheduled_start: datetime | None
    duration_min: int
    timezone: str
    passcode: str
    is_instant: bool
    is_personal_room: bool
    status: MeetingStatus
    created_at: datetime
    ended_at: datetime | None

    @field_validator("status", mode="before")
    @classmethod
    def _enum_to_value(cls, value: object) -> object:
        # Accept either the SQLAlchemy enum member or a plain string.
        return getattr(value, "value", value)

    @computed_field  # type: ignore[prop-decorator]
    @property
    def meeting_id_formatted(self) -> str:
        return format_meeting_id(self.meeting_id)


class MeetingWithHost(MeetingOut):
    host: UserOut


class InstantMeetingOut(BaseModel):
    meeting: MeetingOut
    invite_link: str


# --------------------------------------------------------------------------- #
# Participants
# --------------------------------------------------------------------------- #
class JoinRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)


class ParticipantOut(ORMModel):
    id: int
    meeting_id: int
    user_id: int | None
    display_name: str
    is_host: bool
    is_muted: bool
    video_on: bool
    joined_at: datetime
    left_at: datetime | None


class ParticipantUpdate(BaseModel):
    is_muted: bool | None = None
    video_on: bool | None = None


class JoinResponse(BaseModel):
    participant: ParticipantOut
    meeting: MeetingOut
