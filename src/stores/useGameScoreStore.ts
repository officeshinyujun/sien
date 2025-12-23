import { create } from 'zustand';

export interface PocketedBall {
  index: number;
  color: string;
  type: 'solid' | 'stripe' | 'black' | 'cue';
}

interface GameScoreState {
  pocketedBalls: PocketedBall[];
  addPocketedBall: (ball: PocketedBall) => void;
  resetScore: () => void;
}

export const useGameScoreStore = create<GameScoreState>((set) => ({
  pocketedBalls: [],
  addPocketedBall: (ball) => set((state) => {
    // Prevent duplicates just in case physics triggers multiple events
    if (state.pocketedBalls.some(b => b.index === ball.index)) {
      return state;
    }
    return { pocketedBalls: [...state.pocketedBalls, ball] };
  }),
  resetScore: () => set({ pocketedBalls: [] }),
}));
