from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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