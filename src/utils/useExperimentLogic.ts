import { useState, useEffect, type RefObject } from "react";
import * as THREE from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { useExperimentStore } from "@/stores/useExperimentStore";
import { calculateMomentum } from "./physics";

export function useExperimentLogic(
  rbA: RefObject<RapierRigidBody | null>, 
  rbTargets: RefObject<RapierRigidBody | null>[],
  targetPositions: THREE.Vector3[]
) {
  // Store Data
  const {
    massA, 
    launchForce, launchAngle,
    posA, 
    resetKey, launchKey
  } = useExperimentStore();

  // Local State
  const [velA, setVelA] = useState(new THREE.Vector3());
  // We can track velocity of all targets if needed, but for the graph/stats 
  // we might want just Total Momentum or specific ones. 
  // Let's just track total momentum of targets for now to keep it simple, 
  // or return an array of velocities.
  const [currentPosA, setCurrentPosA] = useState<THREE.Vector3>(new THREE.Vector3(posA, 0, 0));
  const [isStopped, setIsStopped] = useState(true);

  // History for graph - simplified: Just A vs Total B? 
  // Or maybe A vs Target #1? 
  // Given the request "Pool Table", graph might be less relevant or too chaotic with 10 lines.
  // Let's keep A and "Sum of Targets" or just A for now.
  const [historyA, setHistoryA] = useState<number[]>([]);
  const [historyTargets, setHistoryTargets] = useState<number[]>([]);

  // 1. Position Setup (Setup Mode)
  useEffect(() => {
    // Only update position from store if we are resetting or initial setup.
    // If game is in progress, we might ignore this? 
    // Actually, store `posA` is the "Reset Position".
    // So this effect is fine for initial setup or explicit slider moves.
    if (rbA.current) {
        rbA.current.setTranslation({ x: posA, y: 0, z: 0 }, true);
        rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        setCurrentPosA(new THREE.Vector3(posA, 0, 0));
        setIsStopped(true);
    }
  }, [posA]);

  // We don't have a slider for "posB" anymore that moves the whole rack dynamically in setup mode,
  // or if we do, we need to re-calculate targetPositions outside and pass them in.
  // Assuming targetPositions are passed correctly and static or updated via prop.
  useEffect(() => {
    rbTargets.forEach((rb, i) => {
        if (rb.current && targetPositions[i]) {
            rb.current.setTranslation(targetPositions[i], true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
    });
  }, [targetPositions]); // Re-run if positions change (e.g. reset logic triggers this via parent or similar)


  // 2. Reset Action
  useEffect(() => {
    if (resetKey === 0) return; 

    if (rbA.current) {
        setHistoryA([]);
        setHistoryTargets([]);

        // Reset A
        rbA.current.setTranslation({ x: posA, y: 0, z: 0 }, true);
        rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true); 
        rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        setCurrentPosA(new THREE.Vector3(posA, 0, 0));
        setIsStopped(true);

        // Reset Targets
        rbTargets.forEach((rb, i) => {
            if (rb.current && targetPositions[i]) {
                rb.current.setTranslation(targetPositions[i], true);
                rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
        });
    }
  }, [resetKey]); 

  // 3. Launch Action
  useEffect(() => {
    if (launchKey === 0) return;

    if (rbA.current) {
      // Calculate Launch Vector
      const rad = launchAngle * (Math.PI / 180);
      const vx = launchForce * Math.cos(rad);
      const vz = launchForce * Math.sin(rad);

      // Launch A WITHOUT resetting position
      // Just apply velocity from current state
      rbA.current.setLinvel({ x: vx, y: 0, z: vz }, true);
      // rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true); // Optional: reset spin? Usually fine to keep or reset.
      
      setIsStopped(false);
    }
  }, [launchKey]);

  // 4. Data Collection Loop & Stop Detection
  useEffect(() => {
    const interval = setInterval(() => {
        // Performance Optimization: Check if we need to update at all
        // If we are already stopped, and we have confirmed it, we might not need to keep setting state 
        // unless we want to catch the exact moment it starts moving (handled by launchKey).
        // However, drag interactions might move it.
        
        let maxVel = 0;
        let vA = new THREE.Vector3();

        // Check A
        if (rbA.current) {
            const v = rbA.current.linvel();
            vA.set(v.x, v.y, v.z);
            maxVel = Math.max(maxVel, vA.length());
        }
        
        // Check Targets
        let totalSpeedTargets = 0;
        rbTargets.forEach(rb => {
            if (rb.current) {
                const v = rb.current.linvel();
                const speed = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
                totalSpeedTargets += speed;
                maxVel = Math.max(maxVel, speed);
            }
        });

        const stopped = maxVel < 0.1;

        // Update States
        // Only update velocity/history if moving or state changed
        if (!stopped || !isStopped) {
             setVelA(vA);
             setHistoryA(prev => [...prev, vA.length()]);
             setHistoryTargets(prev => [...prev, totalSpeedTargets]);
             setIsStopped(stopped);
        }

        // Update Position only if it matters (stopped or nearly stopped) to update LaunchCue
        if (rbA.current) {
             const pos = rbA.current.translation();
             if (vA.length() < 0.1) {
                 // Throttle position updates or simple check difference?
                 // React's setState won't re-render if value is identical (reference equality for objects is tricky though)
                 // For Vector3, we should check distance.
                 setCurrentPosA(prev => {
                    if (Math.abs(prev.x - pos.x) > 0.01 || Math.abs(prev.z - pos.z) > 0.01) {
                        return new THREE.Vector3(pos.x, pos.y, pos.z);
                    }
                    return prev;
                 });
             }
        }

    }, 50); 
    return () => clearInterval(interval);
  }, [isStopped]); // Add isStopped dependency to correctly gate updates if needed, or keep empty and use functional updates. Empty is safer for interval.

  // 5. Physics Calculations (Derived)
  const momA = calculateMomentum(velA, massA);
  
  return {
    velA, 
    setVelA,
    momA, 
    historyA, 
    historyTargets,
    currentPosA,
    isStopped
  };
}

