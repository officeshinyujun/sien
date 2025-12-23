import { create } from 'zustand';

interface ExperimentState {
  massA: number;
  massB: number;
  restitution: number;
  launchForce: number;
  posA: number;
  posB: number;
  resetKey: number; // 리셋 신호를 위한 값
  focusedSphere: 'A' | 'B' | null;

  setMassA: (val: number) => void;
  setMassB: (val: number) => void;
  setRestitution: (val: number) => void;
  setLaunchForce: (val: number) => void;
  setPosA: (val: number) => void;
  setPosB: (val: number) => void;
  setFocusedSphere: (val: 'A' | 'B' | null) => void;
  triggerReset: () => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  massA: 1,
  massB: 1,
  restitution: 1,
  launchForce: 5,
  posA: -5,
  posB: 5,
  resetKey: 0,
  focusedSphere: null,

  setMassA: (val) => set({ massA: val }),
  setMassB: (val) => set({ massB: val }),
  setRestitution: (val) => set({ restitution: val }),
  setLaunchForce: (val) => set({ launchForce: val }),
  setPosA: (val) => set({ posA: val }),
  setPosB: (val) => set({ posB: val }),
  setFocusedSphere: (val) => set({ focusedSphere: val }),
  triggerReset: () => set((state) => ({ resetKey: state.resetKey + 1 })),
}));
