from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.user import User
from app.models.category import Category
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.core.security import hash_password, verify_password, create_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


DEFAULT_CATEGORIES = ["Food", "Transport", "Rent", "Entertainment", "Other"]


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