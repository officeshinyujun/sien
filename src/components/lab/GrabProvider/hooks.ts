import { createContext, useContext } from "react";
import { RapierRigidBody } from "@react-three/rapier";

export interface GrabContextType {
  grab: (ref: React.RefObject<RapierRigidBody | null>) => void;
  release: () => void;
  isDragging: boolean;
}

export const GrabContext = createContext<GrabContextType | null>(null);

export function useGrab() {
  const context = useContext(GrabContext);
  if (!context) throw new Error("useGrab must be used within a GrabProvider");
  return context;
}
