import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.user import User
from app.models.category import Category
from app.models.password_reset_token import PasswordResetToken
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from app.core.security import hash_password, verify_password, create_token
from app.core.email_service import send_password_reset_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


DEFAULT_CATEGORIES = ["Food", "Transport", "Rent", "Entertainment", "Other"]
RESET_TOKEN_EXPIRE_MINUTES = 30


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password)
    )


    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    # Seed default categories so a new user isn't stuck creating them all
    # manually before they can log their first expense.
    for name in DEFAULT_CATEGORIES:
        db.add(Category(name=name, user_id=new_user.id))

    db.commit()


    return new_user



@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()


    if not existing:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    if not verify_password(
        user.password,
        existing.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )


    token = create_token(
        {
            "sub": existing.email
        }
    )


    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    generic_message = "If that email is registered, a reset link has been sent."

    existing = db.query(User).filter(
        User.email == request.email
    ).first()

    # Always return the same response whether or not the email exists,
    # so this endpoint can't be used to check which emails are registered.
    if not existing:
        return {"message": generic_message}

    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    reset_token = PasswordResetToken(
        user_id=existing.id,
        token_hash=token_hash,
        expires_at=expires_at
    )

    db.add(reset_token)
    db.commit()

    send_password_reset_email(existing.email, raw_token)

    return {"message": generic_message}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    token_hash = _hash_token(request.token)

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    user = db.query(User).filter(
        User.id == reset_token.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    user.hashed_password = hash_password(request.new_password)
    reset_token.used = True

    db.commit()

    return {"message": "Password has been reset successfully."}
