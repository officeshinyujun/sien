import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    nickname: string;
    profile_image?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            clearAuth: () => set({ user: null, token: null }),
            isLoggedIn: () => !!get().token,
        }),
        {
            name: 'auth-storage',
        }
    )
);
