import { create } from 'zustand';

export interface PocketedBall {
  index: number;
  color: string;
  type: 'solid' | 'stripe' | 'black' | 'cue';
}

interface GameScoreState {
  pocketedBalls: PocketedBall[];
  gameStatus: 'playing' | 'finished';
  addPocketedBall: (ball: PocketedBall) => void;
  resetScore: () => void;
}

export const useGameScoreStore = create<GameScoreState>((set) => ({
  pocketedBalls: [],
  gameStatus: 'playing',
  addPocketedBall: (ball) => set((state) => {
    // Prevent duplicates just in case physics triggers multiple events
    if (state.pocketedBalls.some(b => b.index === ball.index)) {
      return state;
    }

    const newPocketedBalls = [...state.pocketedBalls, ball];
    let newGameStatus: 'playing' | 'finished' = state.gameStatus;

    if (ball.type === 'black') {
      // If black ball is pocketed, check if all other 14 balls are already pocketed
      // Note: newPocketedBalls includes the black ball we just added.
      // So total should be 15 if everything is cleared.
      if (newPocketedBalls.length < 15) {
         newGameStatus = 'finished';
      } else {
         // Technically a Win, but user just asked for 'finished' logic for early 8-ball
         newGameStatus = 'finished';
      }
    }

    return { 
        pocketedBalls: newPocketedBalls,
        gameStatus: newGameStatus
    };
  }),
  resetScore: () => set({ pocketedBalls: [], gameStatus: 'playing' }),
}));
