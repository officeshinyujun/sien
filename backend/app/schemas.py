from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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

class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_players: int = 4
    point: int = 0
    restitution: float = 0.8
    friction: float = 0.1

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    image: str
    player_count: int
    owner_id: int

    class Config:
        from_attributes = True

class ShotCreate(BaseModel):
    ball_positions: list[dict]
    type: str = "STOP"

class Shot(ShotCreate):
    id: int
    session_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class GameSessionBase(BaseModel):
    room_id: int

class GameSessionCreate(GameSessionBase):
    pass

class GameSession(GameSessionBase):
    id: int
    user_id: int
    created_at: datetime
    is_active: int

    class Config:
        from_attributes = True