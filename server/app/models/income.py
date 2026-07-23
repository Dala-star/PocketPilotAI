from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.db import Base


class Income(Base):

    __tablename__ = "income"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    amount = Column(
        Float,
        nullable=False
    )


    source = Column(
        String,
        nullable=False
    )


    description = Column(
        String
    )


    date = Column(
        DateTime,
        server_default=func.now()
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )