from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database.db import get_db
from app.dependencies import get_current_user

from app.models.user import User

from app.schemas.profile import (
    UserProfile,
    UserUpdate,
    PasswordUpdate
)

from app.core.security import (
    verify_password,
    hash_password
)

from app.core.email_service import send_feedback_email


class FeedbackRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserProfile)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.put("/me", response_model=UserProfile)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing = (
        db.query(User)
        .filter(
            User.email == data.email,
            User.id != current_user.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already in use"
        )

    current_user.name = data.name
    current_user.email = data.email

    db.commit()
    db.refresh(current_user)

    return current_user


@router.put("/change-password")
def change_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if not verify_password(
        data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = hash_password(
        data.new_password
    )

    db.commit()

    return {
        "message": "Password updated successfully"
    }


@router.post("/feedback")
def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user)
):

    try:
        send_feedback_email(current_user.email, data.message)
    except RuntimeError:
        raise HTTPException(
            status_code=500,
            detail="Unable to send feedback right now. Please try again later."
        )

    return {
        "message": "Feedback sent"
    }