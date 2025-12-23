from sqlalchemy.orm import Session
from . import models, schemas, utils
from .image_gen import generate_dummy_profile_image

def get_user_by_nickname(db: Session, nickname: str):
    return db.query(models.User).filter(models.User.nickname == nickname).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = utils.get_password_hash(user.password)
    profile_image_url = generate_dummy_profile_image(user.nickname)
    db_user = models.User(
        nickname=user.nickname, 
        hashed_password=hashed_password,
        profile_image=profile_image_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_rooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Room).offset(skip).limit(limit).all()

def create_room(db: Session, room: schemas.RoomCreate, user_id: int):
    db_room = models.Room(
        **room.model_dump(), 
        owner_id=user_id,
        image="/testBackground.png", # Default image for now
        player_count=0
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room
