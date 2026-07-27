# schemas/income.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class IncomeCreate(BaseModel):
    amount: float = Field(gt=0)
    source: str
    description: Optional[str] = None


class IncomeUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    source: Optional[str] = None
    description: Optional[str] = None


class IncomeResponse(BaseModel):
    id: int
    amount: float
    source: str
    description: Optional[str]
    user_id: int
    date: datetime

    class Config:
        from_attributes = True