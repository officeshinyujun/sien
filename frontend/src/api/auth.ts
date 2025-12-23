import api from './axios';

export interface User {
    id: number;
    nickname: string;
    profile_image?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export const authApi = {
    signup: async (nickname: string, password: string): Promise<User> => {
        const response = await api.post<User>('/auth/signup', { nickname, password });
        return response.data;
    },

    login: async (nickname: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { nickname, password });
        return response.data;
    },

    me: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
    }
};
