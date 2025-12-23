from sqlalchemy import Column, Integer, String, Float
from .database import Base

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
