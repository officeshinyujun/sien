from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Store active connections: room_id -> {user_id: WebSocket}
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        
        # If user already has a connection in this room, close it or just replace it?
        # Replacing is better for reload. But we should probably close the old one to be clean.
        if user_id in self.active_connections[room_id]:
            try:
                # Optional: Close old connection with a specific code
                # await self.active_connections[room_id][user_id].close()
                pass
            except Exception:
                pass
        
        self.active_connections[room_id][user_id] = websocket

    def disconnect(self, websocket: WebSocket, room_id: int, user_id: int):
        if room_id in self.active_connections:
            # Only remove if it's the SAME websocket object (to avoid race conditions with quick reconnects)
            if user_id in self.active_connections[room_id] and self.active_connections[room_id][user_id] == websocket:
                del self.active_connections[room_id][user_id]
            
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: dict, room_id: int):
        if room_id in self.active_connections:
            # Create a list of sockets to iterate over safely
            for user_id, connection in list(self.active_connections[room_id].items()):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to user {user_id}: {e}")
                    # Handle broken connections gracefully
                    # We might want to remove them here too
                    pass
        else:
            print(f"No active connections for room {room_id}")

manager = ConnectionManager()
