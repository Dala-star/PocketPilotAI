from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.db import Base


class Expense(Base):

    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    date = Column(DateTime, server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))