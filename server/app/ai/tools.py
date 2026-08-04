from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.models.expense import Expense
from app.models.income import Income
from app.models.budget import Budget
from app.models.category import Category


def make_tools(db: Session, user_id: int):
    """Builds the tool functions for one request, bound to this user's db session.

    Gemini reads each function's docstring and type hints to build its own
    schema and decide when to call it, so no manual JSON schema needed.
    """

    def get_recent_expenses(days: int = 30) -> list[dict]:
        """Get the user's recent expenses, with amount, description, category, and date.

        Args:
            days: How many days back to look. Defaults to 30.
        """
        since = datetime.utcnow() - timedelta(days=days)
        rows = (
            db.query(Expense, Category.name)
            .join(Category, Expense.category_id == Category.id)
            .filter(Expense.user_id == user_id, Expense.date >= since)
            .order_by(Expense.date.desc())
            .all()
        )
        return [
            {
                "amount": float(e.amount),
                "description": e.description,
                "category": cat_name,
                "date": e.date.isoformat(),
            }
            for e, cat_name in rows
        ]

    def get_recent_income(days: int = 30) -> list[dict]:
        """Get the user's recent income entries, with amount, source, description, and date.

        Args:
            days: How many days back to look. Defaults to 30.
        """
        since = datetime.utcnow() - timedelta(days=days)
        rows = (
            db.query(Income)
            .filter(Income.user_id == user_id, Income.date >= since)
            .order_by(Income.date.desc())
            .all()
        )
        return [
            {
                "amount": float(i.amount),
                "source": i.source,
                "description": i.description,
                "date": i.date.isoformat(),
            }
            for i in rows
        ]

    def get_budget_status() -> list[dict]:
        """Get the user's budgets per category, how much they've spent, and remaining amount/percentage."""
        budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
        result = []
        for b in budgets:
            spent = (
                db.query(func.coalesce(func.sum(Expense.amount), 0))
                .filter(Expense.user_id == user_id, Expense.category_id == b.category_id)
                .scalar()
            )
            category = db.query(Category).filter(Category.id == b.category_id).first()
            budget_amount = float(b.amount)
            spent_amount = float(spent)
            result.append({
                "category": category.name if category else "Unknown",
                "budget": budget_amount,
                "spent": spent_amount,
                "remaining": budget_amount - spent_amount,
                "percentage_used": round((spent_amount / budget_amount) * 100, 1) if budget_amount else 0,
            })
        return result

    return [get_recent_expenses, get_recent_income, get_budget_status]