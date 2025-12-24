import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type GameState = 'WAIT' | 'MOVING' | 'STOPPED';

export interface BallState {
  id: number; // 0 for Cue, 1-15 for targets
  position: Vector3;
  rotation: Vector3;
}

interface ExperimentState {
  gameState: GameState;
  massA: number;
  massB: number;
  restitution: number;
  friction: number;
  launchForce: number;
  launchAngle: number;
  posA: number;
  posB: number;
  resetKey: number;
  launchKey: number;
  focusedSphere: 'A' | 'B' | null;
  
  balls: BallState[]; // Store positions/rotations of all balls

  setGameState: (state: GameState) => void;
  setMassA: (val: number) => void;
  setMassB: (val: number) => void;
  setRestitution: (val: number) => void;
  setFriction: (val: number) => void;
  setLaunchForce: (val: number) => void;
  setLaunchAngle: (val: number) => void;
  setPosA: (val: number) => void;
  setPosB: (val: number) => void;
  setFocusedSphere: (val: 'A' | 'B' | null) => void;
  triggerReset: () => void;
  triggerLaunch: () => void;
  setBalls: (balls: BallState[]) => void;
}

export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set) => ({
      gameState: 'WAIT',
      massA: 1,
      massB: 1,
      restitution: 0.8,
      friction: 0.5,
      launchForce: 5,
      launchAngle: 0,
      posA: -5,
      posB: 5,
      resetKey: 0,
      launchKey: 0,
      focusedSphere: null,
      balls: [],

      setGameState: (state) => set({ gameState: state }),
      setMassA: (val) => set({ massA: val }),
      setMassB: (val) => set({ massB: val }),
      setRestitution: (val) => set({ restitution: val }),
      setFriction: (val) => set({ friction: val }),
      setLaunchForce: (val) => set({ launchForce: val }),
      setLaunchAngle: (val) => set({ launchAngle: val }),
      setPosA: (val) => set({ posA: val }),
      setPosB: (val) => set({ posB: val }),
      setFocusedSphere: (val) => set({ focusedSphere: val }),
      triggerReset: () => set((state) => ({ resetKey: state.resetKey + 1, gameState: 'WAIT' })),
      triggerLaunch: () => set((state) => ({ launchKey: state.launchKey + 1, gameState: 'MOVING' })),
      setBalls: (balls) => set({ balls }),
    }),
    {
      name: 'experiment-storage',
      partialize: (state) => ({ 
        // Only persist these fields if needed. For now persisting everything except keys might be safer?
        // Let's persist basic configs and balls. keys should reset on reload probably.
        massA: state.massA,
        massB: state.massB,
        restitution: state.restitution,
        friction: state.friction,
        launchForce: state.launchForce,
        launchAngle: state.launchAngle,
        posA: state.posA,
        posB: state.posB,
        balls: state.balls,
      }),
    }
  )
);
