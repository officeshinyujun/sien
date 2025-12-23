import { useState, useEffect, type RefObject } from "react";
import * as THREE from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { useExperimentStore } from "@/stores/useExperimentStore";
import { calculateMomentum, calculateTotalMomentum } from "./physics";


export function useExperimentLogic(
  rbA: RefObject<RapierRigidBody | null>, 
  rbB: RefObject<RapierRigidBody | null>
) {
  // Store Data
  const { 
    massA, massB, 
    launchForce, 
    posA, posB,
    resetKey 
  } = useExperimentStore();

  // Local State
  const [velA, setVelA] = useState(new THREE.Vector3());
  const [velB, setVelB] = useState(new THREE.Vector3());
  const [historyA, setHistoryA] = useState<number[]>([]);
  const [historyB, setHistoryB] = useState<number[]>([]);

  // 1. Position Setup (Setup Mode) - Sliders update positions instantly
  useEffect(() => {
    if (rbA.current) {
        rbA.current.setTranslation({ x: posA, y: 0.5, z: 0 }, true);
        rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [posA]);

  useEffect(() => {
    if (rbB.current) {
        rbB.current.setTranslation({ x: posB, y: 0.5, z: 0 }, true);
        rbB.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbB.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [posB]);

  // 2. Reset / Launch Action
  useEffect(() => {
    if (resetKey === 0) return; 

    if (rbA.current && rbB.current) {
      // Clear Graph History
      setHistoryA([]);
      setHistoryB([]);

      // Launch A
      rbA.current.setTranslation({ x: posA, y: 0.5, z: 0 }, true);
      rbA.current.setLinvel({ x: launchForce, y: 0, z: 0 }, true); 
      rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Reset B
      rbB.current.setTranslation({ x: posB, y: 0.5, z: 0 }, true);
      rbB.current.setLinvel({ x: 0, y: 0, z: 0 }, true); 
      rbB.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [resetKey]); // Dependencies captured from store

  // 3. Data Collection Loop (Graph History)
  useEffect(() => {
    const interval = setInterval(() => {
        setHistoryA(prev => [...prev, velA.length()]);
        setHistoryB(prev => [...prev, velB.length()]);
    }, 50); 
    return () => clearInterval(interval);
  }, [velA, velB]);

  // 4. Physics Calculations
  const momA = calculateMomentum(velA, massA);
  const momB = calculateMomentum(velB, massB);
  const totalMom = calculateTotalMomentum(momA, momB);

  return {
    velA, setVelA,
    velB, setVelB,
    momA, momB,
    totalMom,
    historyA, historyB
  };
}
