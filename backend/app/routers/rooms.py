from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, utils
from ..database import get_db

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Room])
def read_rooms(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    rooms = crud.get_rooms(db, skip=skip, limit=limit)
    return rooms

@router.post("/", response_model=schemas.Room, status_code=status.HTTP_201_CREATED)
def create_room(
    room: schemas.RoomCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(utils.get_current_user)
):
    return crud.create_room(db=db, room=room, user_id=current_user.id)
