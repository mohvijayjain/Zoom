"""Participant endpoints — mute / video toggles, and leaving a meeting."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import Participant
from ..utils import utcnow

router = APIRouter(prefix="/participants", tags=["participants"])


@router.patch("/{participant_id}", response_model=schemas.ParticipantOut)
def update_participant(
    participant_id: int,
    payload: schemas.ParticipantUpdate,
    db: Session = Depends(get_db),
) -> Participant:
    participant = db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Only apply the fields the client actually sent.
    updates = payload.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in updates.items():
        setattr(participant, field, value)

    db.commit()
    db.refresh(participant)
    return participant


@router.delete("/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_participant(
    participant_id: int,
    db: Session = Depends(get_db),
) -> Response:
    """Leave (or be removed from) a meeting.

    A soft delete: `left_at` is stamped and the row stays. `GET /participants`
    filters on `left_at IS NULL`, so the participant drops out of every
    client's next poll — while "who attended this meeting" stays answerable.
    """
    participant = db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Idempotent: leaving twice is not an error.
    if participant.left_at is None:
        participant.left_at = utcnow()
        db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)
