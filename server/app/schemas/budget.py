from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    amount: float = Field(gt=0)
    category_id: int


class BudgetUpdate(BaseModel):
    amount: float = Field(gt=0)


class BudgetResponse(BaseModel):
    id: int
    amount: float
    category_id: int
    user_id: int
    spent: float = 0.0
    percentage: float = 0.0

    class Config:
        from_attributes = True