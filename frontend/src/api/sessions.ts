import api from './axios';
import { type BallState } from '@/stores/useExperimentStore';

export interface GameSession {
    id: number;
    room_id: number;
    user_id: number;
    is_active: number;
}

export interface Shot {
    id: number;
    session_id: number;
    ball_positions: BallState[];
    type: 'LAUNCH' | 'STOP';
    created_at: string;
}

export const sessionsApi = {
    createSession: async (roomId: number): Promise<GameSession> => {
        const response = await api.post<GameSession>('/sessions/', { room_id: roomId });
        return response.data;
    },

    saveShot: async (sessionId: number, ballPositions: BallState[], type: 'LAUNCH' | 'STOP' = 'STOP'): Promise<Shot> => {
        const response = await api.post<Shot>(`/sessions/${sessionId}/shots`, {
            ball_positions: ballPositions,
            type
        });
        return response.data;
    },

    endSession: async (sessionId: number): Promise<void> => {
        await api.patch(`/sessions/${sessionId}/end`);
    }
};
