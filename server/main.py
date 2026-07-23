from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import Base, engine
from app.models import user
from app.models import income
from app.models import expense
from app.models import category
from app.routes import auth


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


@app.get("/")
def home():
    return {
        "message": "PocketPilot AI API is running"
    }