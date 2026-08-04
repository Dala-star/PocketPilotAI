from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import Base, engine

from app.models import user
from app.models import income
from app.models import expense
from app.models import category
from app.models import budget
from app.models.password_reset_token import PasswordResetToken

from app.routes import auth
from app.routes import expenses
from app.routes import categories
from app.routes import income
from app.routes import budgets
from app.routes import users
from app.routes import ai

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="PocketPilot AI API"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(categories.router)
app.include_router(income.router)
app.include_router(budgets.router)
app.include_router(users.router)
app.include_router(ai.router)


@app.get("/")
def home():
    return {
        "message": "PocketPilot AI API is running"
    }