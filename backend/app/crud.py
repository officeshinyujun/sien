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
