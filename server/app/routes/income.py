from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.dependencies import get_current_user

from app.models.user import User
from app.models.income import Income

from app.schemas.income import (
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse
)


router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


@router.post("/", response_model=IncomeResponse)
def create_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_income = Income(
        amount=income.amount,
        source=income.source,
        description=income.description,
        user_id=current_user.id
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income



@router.get("/", response_model=list[IncomeResponse])
def get_income(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return (
        db.query(Income)
        .filter(
            Income.user_id == current_user.id
        )
        .order_by(
            Income.date.desc()
        )
        .all()
    )



@router.get("/{income_id}", response_model=IncomeResponse)
def get_single_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    income = (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == current_user.id
        )
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    return income



@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    data: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    income = (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == current_user.id
        )
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )


    income.amount = data.amount
    income.source = data.source
    income.description = data.description


    db.commit()
    db.refresh(income)

    return income



@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    income = (
        db.query(Income)
        .filter(
            Income.id == income_id,
            Income.user_id == current_user.id
        )
        .first()
    )

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )


    db.delete(income)
    db.commit()


    return {
        "message": "Income deleted successfully"
    }