from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.dependencies import get_current_user

from app.models.user import User
from app.models.budget import Budget
from app.models.category import Category
from app.models.expense import Expense

from app.schemas.budget import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse
)


router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)


def attach_progress(db: Session, budget: Budget, user_id: int) -> Budget:
    """
    Computes how much has been spent this calendar month in the budget's
    category, and attaches spent/percentage onto the ORM object so the
    response schema (from_attributes) can pick them up. Not persisted to
    the database — recalculated fresh on every read.
    """

    now = datetime.utcnow()

    spent = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(
            Expense.category_id == budget.category_id,
            Expense.user_id == user_id,
            extract("year", Expense.date) == now.year,
            extract("month", Expense.date) == now.month,
        )
        .scalar()
    )

    spent = float(spent or 0)

    percentage = (spent / float(budget.amount) * 100) if budget.amount else 0.0

    budget.spent = spent
    budget.percentage = round(percentage, 1)

    return budget


@router.post("/", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    category = (
        db.query(Category)
        .filter(
            Category.id == budget.category_id,
            Category.user_id == current_user.id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    existing = (
        db.query(Budget)
        .filter(
            Budget.category_id == budget.category_id,
            Budget.user_id == current_user.id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category"
        )

    new_budget = Budget(
        amount=budget.amount,
        category_id=budget.category_id,
        user_id=current_user.id
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return attach_progress(db, new_budget, current_user.id)


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budgets = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id
        )
        .all()
    )

    return [attach_progress(db, b, current_user.id) for b in budgets]


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    budget.amount = data.amount

    db.commit()
    db.refresh(budget)

    return attach_progress(db, budget, current_user.id)


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }