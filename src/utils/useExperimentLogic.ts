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
        let maxVel = 0;

        // Check A
        if (rbA.current) {
            const v = rbA.current.linvel();
            const vec = new THREE.Vector3(v.x, v.y, v.z);
            setVelA(vec);
            setHistoryA(prev => [...prev, vec.length()]);
            maxVel = Math.max(maxVel, vec.length());

             // Update tracked position for LaunchCue ONLY if moving (or just stopped)
             // Optimization: only update state if significant change or just stopped
             const pos = rbA.current.translation();
             // We need to update currentPosA so LaunchCue follows the ball
             // But doing this every 50ms might cause jittery UI if LaunchCue is rendered via React state.
             // However, LaunchCue is only visible when stopped. 
             // So we mainly need accurate final position when stopped.
             if (vec.length() < 0.05) {
                 setCurrentPosA(new THREE.Vector3(pos.x, pos.y, pos.z));
             }
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
        setHistoryTargets(prev => [...prev, totalSpeedTargets]);

        // Global Stop Detection
        // If everything is moving very slowly, consider stopped.
        const stopped = maxVel < 0.1;
        setIsStopped(stopped);

    }, 50); 
    return () => clearInterval(interval);
  }, []); // Empty dependency to run once and use refs

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

