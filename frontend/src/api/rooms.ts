import api from './axios';
import { type RoomProps } from '@/components/Main/Room/type';

// Backend Room Interface
export interface BackendRoom {
    id: number;
    name: string;
    description: string;
    max_players: number;
    point: number;
    restitution: number;
    friction: number;
    image: string;
    player_count: number;
    owner_id: number;
}

export interface CreateRoomRequest {
    name: string;
    description: string;
    max_players?: number;
    point?: number;
    restitution?: number;
    friction?: number;
}

export const roomsApi = {
    getAll: async (): Promise<RoomProps[]> => {
        const response = await api.get<BackendRoom[]>('/rooms/');
        return response.data.map(room => ({
            id: room.id.toString(),
            image: `http://localhost:8000${room.image}`, // Prepend backend URL if relative
            name: room.name,
            playerCount: room.player_count,
            point: room.point,
            maxPlayers: room.max_players,
            description: room.description,
            physics: {
                restitution: room.restitution,
                friction: room.friction,
            }
        }));
    },

    create: async (data: CreateRoomRequest): Promise<BackendRoom> => {
        const response = await api.post<BackendRoom>('/rooms/', data);
        return response.data;
    }
};
