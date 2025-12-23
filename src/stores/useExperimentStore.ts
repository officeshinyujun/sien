import { create } from 'zustand';

interface ExperimentState {
  massA: number;
  massB: number; // Mass of each target sphere
  restitution: number;
  friction: number;
  launchForce: number;
  launchAngle: number;
  posA: number;
  posB: number;
  resetKey: number; // 리셋 신호를 위한 값
  launchKey: number; // 발사 신호를 위한 값
  focusedSphere: 'A' | 'B' | null;

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
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  massA: 1,
  massB: 1,
  restitution: 0.3,
  friction: 0.5,
  launchForce: 5,
  launchAngle: 0,
  posA: -5,
  posB: 5,
  resetKey: 0,
  launchKey: 0,
  focusedSphere: null,

  setMassA: (val) => set({ massA: val }),
  setMassB: (val) => set({ massB: val }),
  setRestitution: (val) => set({ restitution: val }),
  setFriction: (val) => set({ friction: val }),
  setLaunchForce: (val) => set({ launchForce: val }),
  setLaunchAngle: (val) => set({ launchAngle: val }),
  setPosA: (val) => set({ posA: val }),
  setPosB: (val) => set({ posB: val }),
  setFocusedSphere: (val) => set({ focusedSphere: val }),
  triggerReset: () => set((state) => ({ resetKey: state.resetKey + 1 })),
  triggerLaunch: () => set((state) => ({ launchKey: state.launchKey + 1 })),
}));
