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

def create_session(db: Session, session: schemas.GameSessionCreate, user_id: int):
    db_session = models.GameSession(
        room_id=session.room_id,
        user_id=user_id,
        is_active=1
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def create_shot(db: Session, shot: schemas.ShotCreate, session_id: int):
    db_shot = models.Shot(
        session_id=session_id,
        ball_positions=shot.ball_positions,
        type=shot.type
    )
    db.add(db_shot)
    db.commit()
    db.refresh(db_shot)
    return db_shot

def get_active_users_in_room(db: Session, room_id: int):
    return db.query(models.User).join(models.GameSession).filter(
        models.GameSession.room_id == room_id,
        models.GameSession.is_active == 1
    ).all()

def end_session(db: Session, session_id: int):
    db_session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if db_session:
        db_session.is_active = 0
        db.commit()
        db.refresh(db_session)
    return db_session

def get_latest_shot_in_room(db: Session, room_id: int):
    return db.query(models.Shot).join(models.GameSession).filter(
        models.GameSession.room_id == room_id
    ).order_by(models.Shot.created_at.desc()).first()
