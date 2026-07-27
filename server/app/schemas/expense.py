from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    description: Optional[str] = None
    category_id: int


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    category_id: Optional[int] = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str]
    category_id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True