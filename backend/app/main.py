from fastapi import FastAPI
from .database import engine, Base
from .routers import auth, rooms, sessions
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import WebSocket, WebSocketDisconnect
from .websocket import manager
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Mount static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(STATIC_DIR, exist_ok=True) # Ensure it exists
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(sessions.router)

@app.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int, user_id: int):
    await manager.connect(websocket, room_id, user_id)
    try:
        while True:
            await websocket.receive_text() # Keep connection alive, listen for ping/pong if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, user_id)

@app.get("/")
def read_root():
    return {"Hello": "World"}
