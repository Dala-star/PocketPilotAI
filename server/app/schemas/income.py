from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: Optional[str] = None


class IncomeUpdate(BaseModel):
    amount: float
    source: str
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