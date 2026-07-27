from pydantic import BaseModel, EmailStr
from pydantic import BaseModel, EmailStr, Field

class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str
    email: EmailStr


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)