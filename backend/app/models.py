from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_image = Column(String, nullable=True)

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    image = Column(String, default="/testBackground.png")
    name = Column(String, index=True)
    player_count = Column(Integer, default=0)
    point = Column(Integer, default=0)
    max_players = Column(Integer, default=4)
    description = Column(String)
    
    # Physics properties
    restitution = Column(Float, default=0.8)
    friction = Column(Float, default=0.1)
    
    # Relationship with User (Creator)
    owner_id = Column(Integer, index=True, nullable=False)

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1) # 1: active, 0: finished

    shots = relationship("Shot", back_populates="session")

class Shot(Base):
    __tablename__ = "shots"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("game_sessions.id"))
    ball_positions = Column(JSON) # Stores list of ball states
    type = Column(String, default="STOP") # LAUNCH, STOP
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("GameSession", back_populates="shots")
