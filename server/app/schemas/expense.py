from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ExpenseCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    category_id: int

class ExpenseUpdate(BaseModel):
    amount: float
    description: Optional[str] = None
    category_id: int
    
class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str]
    category_id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True