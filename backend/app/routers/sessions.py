from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, utils
from ..database import get_db
from ..websocket import manager
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.GameSession, status_code=status.HTTP_201_CREATED)
def create_session(
    session: schemas.GameSessionCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(utils.get_current_user)
):
    return crud.create_session(db=db, session=session, user_id=current_user.id)

@router.post("/{session_id}/shots", response_model=schemas.Shot, status_code=status.HTTP_201_CREATED)
async def create_shot(
    session_id: int,
    shot: schemas.ShotCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    # Verify session and get room_id
    db_session = db.query(models.GameSession).filter(models.GameSession.id == session_id).first()
    if not db_session:
         raise HTTPException(status_code=404, detail="Session not found")

    # Create Shot
    new_shot = crud.create_shot(db=db, shot=shot, session_id=session_id)
    
    # Broadcast to Room via WebSocket
    # Manually construct dict to avoid serialization issues with complex SQLAlchemy models
    broadcast_message = {
        "type": "SHOT_SAVED",
        "shot": {
            "id": new_shot.id,
            "session_id": new_shot.session_id,
            "ball_positions": new_shot.ball_positions,
            "type": new_shot.type,
            # "created_at": new_shot.created_at.isoformat() if new_shot.created_at else None
        },
        "user_id": current_user.id
    }

    await manager.broadcast(
        message=broadcast_message,
        room_id=db_session.room_id
    )
    
    return new_shot

@router.patch("/{session_id}/end", response_model=schemas.GameSession)
def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(utils.get_current_user)
):
    # Ideally verify user owns the session
    return crud.end_session(db=db, session_id=session_id)
