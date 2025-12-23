from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    nickname: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    nickname: Optional[str] = None