from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.core.security import verify_token
from app.models.user import User


oauth2_scheme = HTTPBearer()


def get_current_user(

    credentials = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    payload = verify_token(
        credentials.credentials.replace("Bearer ", "")
    )

    email = payload.get("sub")


    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication"
        )


    user = db.query(User).filter(
        User.email == email
    ).first()


    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )


    return user