"""Meeting endpoints.

Routers never touch the engine directly — they receive a Session via
`Depends(get_db)` and speak to the DB only through the models.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import Meeting, MeetingStatus, Participant
from ..seed import get_default_user
from ..utils import as_naive_utc, generate_meeting_id, generate_passcode, invite_link, utcnow

router = APIRouter(prefix="/meetings", tags=["meetings"])

RECENT_LIMIT = 10


def _frontend_url() -> str:
    return os.getenv("FRONTEND_URL", "http://localhost:3000")


def _sweep_expired(db: Session, now: datetime) -> None:
    """Retire scheduled meetings whose slot has fully elapsed.

    Without this, a meeting nobody joined drops out of `upcoming` (its start is
    in the past) but never reaches `recent` (it is still `scheduled`), so it
    disappears from the dashboard entirely. Running it once per list call keeps
    both filters reading the same consistent view.
    """
    # scheduled_start < now is a cheap necessary condition for expiry, so the
    # duration arithmetic only runs on rows that could possibly qualify.
    candidates = (
        db.query(Meeting)
        .filter(
            Meeting.status == MeetingStatus.scheduled,
            Meeting.scheduled_start.is_not(None),
            Meeting.scheduled_start < now,
        )
        .all()
    )

    expired = False
    for meeting in candidates:
        finished_at = meeting.scheduled_start + timedelta(minutes=meeting.duration_min)
        if finished_at < now:
            meeting.status = MeetingStatus.ended
            meeting.ended_at = finished_at
            expired = True

    if expired:
        db.commit()


def _get_meeting_or_404(db: Session, meeting_id: str) -> Meeting:
    """Look up by the shareable 11-digit meeting_id, not the surrogate PK."""
    meeting = db.query(Meeting).filter(Meeting.meeting_id == meeting_id).first()
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting ID not found")
    return meeting


@router.post("/instant", response_model=schemas.InstantMeetingOut, status_code=201)
def create_instant_meeting(
    use_personal_room: bool = Query(
        False, description="Host the instant meeting in the personal meeting room"
    ),
    db: Session = Depends(get_db),
) -> schemas.InstantMeetingOut:
    """Start a meeting that is live immediately (no scheduled_start)."""
    user = get_default_user(db)
    now = utcnow()

    if use_personal_room:
        # A personal room is a stable ID that gets reused, so reopen the
        # existing row rather than colliding on the unique meeting_id.
        meeting = (
            db.query(Meeting).filter(Meeting.meeting_id == user.personal_meeting_id).first()
        )
        if meeting is not None:
            meeting.status = MeetingStatus.live
            meeting.ended_at = None
            meeting.created_at = now
            db.commit()
            db.refresh(meeting)
            return schemas.InstantMeetingOut(
                meeting=schemas.MeetingOut.model_validate(meeting),
                invite_link=invite_link(meeting.meeting_id, _frontend_url()),
            )

    new_id = user.personal_meeting_id if use_personal_room else generate_meeting_id(db)

    meeting = Meeting(
        meeting_id=new_id,
        host_id=user.id,
        topic=f"{user.name} - Zoom Meeting",
        description=None,
        scheduled_start=None,
        duration_min=40,
        timezone="Asia/Kolkata",
        passcode=generate_passcode(),
        is_instant=True,
        is_personal_room=use_personal_room,
        status=MeetingStatus.live,
        created_at=now,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    return schemas.InstantMeetingOut(
        meeting=schemas.MeetingOut.model_validate(meeting),
        invite_link=invite_link(meeting.meeting_id, _frontend_url()),
    )


@router.post("", response_model=schemas.MeetingOut, status_code=201)
def create_scheduled_meeting(
    payload: schemas.MeetingCreate,
    db: Session = Depends(get_db),
) -> Meeting:
    user = get_default_user(db)

    meeting = Meeting(
        meeting_id=generate_meeting_id(db),
        host_id=user.id,
        topic=payload.topic,
        description=payload.description,
        scheduled_start=as_naive_utc(payload.scheduled_start),
        duration_min=payload.duration_min,
        timezone=payload.timezone,
        passcode=generate_passcode(),
        is_instant=False,
        is_personal_room=False,
        status=MeetingStatus.scheduled,
        created_at=utcnow(),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("", response_model=list[schemas.MeetingOut])
def list_meetings(
    filter: schemas.MeetingFilter = Query("upcoming", description="upcoming | recent"),
    db: Session = Depends(get_db),
) -> list[Meeting]:
    now = utcnow()
    _sweep_expired(db, now)

    if filter == "upcoming":
        return (
            db.query(Meeting)
            .filter(
                Meeting.status == MeetingStatus.scheduled,
                Meeting.scheduled_start.is_not(None),
                Meeting.scheduled_start >= now,
            )
            .order_by(Meeting.scheduled_start.asc())
            .all()
        )

    return (
        db.query(Meeting)
        .filter(Meeting.status == MeetingStatus.ended)
        .order_by(Meeting.ended_at.desc())
        .limit(RECENT_LIMIT)
        .all()
    )


@router.get("/{meeting_id}", response_model=schemas.MeetingWithHost)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)) -> Meeting:
    """Also doubles as the validate-this-ID call for the join screen."""
    return _get_meeting_or_404(db, meeting_id)


@router.post("/{meeting_id}/join", response_model=schemas.JoinResponse, status_code=201)
def join_meeting(
    meeting_id: str,
    payload: schemas.JoinRequest,
    db: Session = Depends(get_db),
) -> schemas.JoinResponse:
    meeting = _get_meeting_or_404(db, meeting_id)

    if meeting.status == MeetingStatus.ended:
        raise HTTPException(status_code=409, detail="This meeting has ended")

    user = get_default_user(db)
    display_name = payload.display_name.strip()

    # The default user is the host of their own meetings; link the row to the
    # account in that case, and treat everyone else as a guest.
    is_host = meeting.host_id == user.id and display_name == user.name
    already_hosted = (
        db.query(Participant.id)
        .filter(
            Participant.meeting_id == meeting.id,
            Participant.is_host.is_(True),
            Participant.left_at.is_(None),
        )
        .first()
        is not None
    )
    is_host = is_host and not already_hosted

    participant = Participant(
        meeting_id=meeting.id,
        user_id=user.id if is_host else None,
        display_name=display_name,
        is_host=is_host,
        is_muted=not is_host,
        video_on=is_host,
        joined_at=utcnow(),
    )
    db.add(participant)

    if meeting.status == MeetingStatus.scheduled:
        meeting.status = MeetingStatus.live

    db.commit()
    db.refresh(participant)
    db.refresh(meeting)

    return schemas.JoinResponse(
        participant=schemas.ParticipantOut.model_validate(participant),
        meeting=schemas.MeetingOut.model_validate(meeting),
    )


@router.post("/{meeting_id}/end", response_model=schemas.MeetingOut)
def end_meeting(meeting_id: str, db: Session = Depends(get_db)) -> Meeting:
    meeting = _get_meeting_or_404(db, meeting_id)

    if meeting.status == MeetingStatus.ended:
        return meeting  # idempotent: ending twice is not an error

    now = utcnow()
    meeting.status = MeetingStatus.ended
    meeting.ended_at = now

    for participant in meeting.participants:
        if participant.left_at is None:
            participant.left_at = now

    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}/participants", response_model=list[schemas.ParticipantOut])
def list_participants(meeting_id: str, db: Session = Depends(get_db)) -> list[Participant]:
    meeting = _get_meeting_or_404(db, meeting_id)
    return (
        db.query(Participant)
        .filter(Participant.meeting_id == meeting.id, Participant.left_at.is_(None))
        .order_by(Participant.is_host.desc(), Participant.joined_at.asc())
        .all()
    )
