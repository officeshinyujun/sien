import { useState, useEffect, type RefObject } from "react";
import * as THREE from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { useExperimentStore, type BallState } from "@/stores/useExperimentStore";
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
    resetKey, launchKey,
    setBalls,
    gameState, setGameState
  } = useExperimentStore();

  // Local State
  const [velA, setVelA] = useState(new THREE.Vector3());
  const [currentPosA, setCurrentPosA] = useState<THREE.Vector3>(new THREE.Vector3(posA, 0, 0));
  
  // 1. Position Setup & Sync (WAIT State)
  // This should ONLY happen if we explicitly want to reset or change initial setup.
  // Not just because we entered WAIT state after a shot.
  
  // Strategy: 
  // - On Mount: Set initial positions.
  // - On posA change: Update cue ball (only if WAIT).
  // - On resetKey: Full reset (handled below).
  
  // We remove 'gameState' from dependency array to prevent auto-reset on state change.
  useEffect(() => {
    if (gameState === 'WAIT' && rbA.current) {
        rbA.current.setTranslation({ x: posA, y: 0, z: 0 }, true);
        rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        
        setTimeout(() => {
            setCurrentPosA(new THREE.Vector3(posA, 0, 0));
        }, 0);
    }
  }, [posA]); // Only run when posA slider changes (and initial mount)

  useEffect(() => {
    // Sync Targets only when targetPositions change (e.g. initial setup)
    // We don't want to reset them just because we went to WAIT.
    if (gameState === 'WAIT') {
        rbTargets.forEach((rb, i) => {
            if (rb.current && targetPositions[i]) {
                rb.current.setTranslation(targetPositions[i], true);
                rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
        });
    }
  }, [targetPositions]); // Only run when targetPositions config changes


  // 2. Reset Action
  useEffect(() => {
    if (resetKey === 0) return; 

    if (rbA.current) {
        rbA.current.setTranslation({ x: posA, y: 0, z: 0 }, true);
        rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true); 
        rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        
        rbTargets.forEach((rb, i) => {
            if (rb.current && targetPositions[i]) {
                rb.current.setTranslation(targetPositions[i], true);
                rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
        });
        
        setTimeout(() => {
            setCurrentPosA(new THREE.Vector3(posA, 0, 0));
            // GameState is already set to WAIT by triggerReset
        }, 0);
    }
  }, [resetKey]); 

  // 3. Launch Action
  useEffect(() => {
    if (launchKey === 0) return;

    if (rbA.current) {
      const rad = launchAngle * (Math.PI / 180);
      const vx = launchForce * Math.cos(rad);
      const vz = launchForce * Math.sin(rad);

      rbA.current.setLinvel({ x: vx, y: 0, z: vz }, true);
      // GameState is already set to MOVING by triggerLaunch
    }
  }, [launchKey]);

  // 4. Data Collection Loop & State Transition
  useEffect(() => {
    const interval = setInterval(() => {
        
        let maxVel = 0;
        const vA = new THREE.Vector3();

        // Check A
        if (rbA.current) {
            const v = rbA.current.linvel();
            vA.set(v.x, v.y, v.z);
            maxVel = Math.max(maxVel, vA.length());
        }
        
        // Check Targets
        rbTargets.forEach(rb => {
            if (rb.current) {
                const v = rb.current.linvel();
                const speed = Math.sqrt(v.x**2 + v.y**2 + v.z**2);
                maxVel = Math.max(maxVel, speed);
            }
        });

        // Collect Ball States (Only update store if moving to save performance and prevent overwriting sync)
        if (gameState === 'MOVING') {
            const currentBalls: BallState[] = [];
            // ... (Ball collection code remains same) ...
            // Cue Ball
            if (rbA.current) {
                const t = rbA.current.translation();
                const r = rbA.current.rotation();
                const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                currentBalls.push({
                    id: 0,
                    position: { x: t.x, y: t.y, z: t.z },
                    rotation: { x: euler.x, y: euler.y, z: euler.z }
                });
            }
            // Target Balls
            rbTargets.forEach((rb, i) => {
                if (rb.current) {
                    const t = rb.current.translation();
                    const r = rb.current.rotation();
                    const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                    currentBalls.push({
                        id: i + 1,
                        position: { x: t.x, y: t.y, z: t.z },
                        rotation: { x: euler.x, y: euler.y, z: euler.z }
                    });
                }
            });
            setBalls(currentBalls);
        }


        // State Transition Logic
        if (gameState === 'MOVING') {
            if (maxVel < 0.1) {
                // All balls stopped -> Transition to STOPPED
                setGameState('STOPPED');
            }
        }
        
        // Update velocity state for UI/Graphs if needed
        setVelA(vA);

        // Update Position for Cue Stick (only if stopped)
        if (rbA.current && maxVel < 0.1) {
             const pos = rbA.current.translation();
             setCurrentPosA(prev => {
                if (Math.abs(prev.x - pos.x) > 0.01 || Math.abs(prev.z - pos.z) > 0.01) {
                    return new THREE.Vector3(pos.x, pos.y, pos.z);
                }
                return prev;
             });
        }

    }, 50); 
    return () => clearInterval(interval);
  }, [gameState, setGameState, setBalls]); // Depend on gameState

  // 5. Physics Calculations (Derived)
  const momA = calculateMomentum(velA, massA);
  
  // 6. External Sync Function
  const syncBalls = (balls: BallState[]) => {
      // Only allow sync if we are in WAIT state (idle)
      if (gameState !== 'WAIT') return;
      
      console.log("Syncing balls count:", balls.length);

      // Cue Ball - Define here so it's captured in closure for setTimeout or accessible
      const cueBall = balls.find(b => b.id === 0);

      setBalls(balls);
      
      // Update Physics (Teleport)
      // Use setTimeout to ensure this runs after any React state updates/re-renders
      setTimeout(() => {
          // Cue Ball
          if (cueBall && rbA.current) {
              rbA.current.setTranslation(cueBall.position, true);
              rbA.current.setLinvel({x: 0, y: 0, z: 0}, true);
              rbA.current.setAngvel({x: 0, y: 0, z: 0}, true);
              rbA.current.wakeUp();
              setCurrentPosA(new THREE.Vector3(cueBall.position.x, cueBall.position.y, cueBall.position.z));
          }

          // Target Balls
          let syncedCount = 0;
          rbTargets.forEach((rb, i) => {
              const targetBall = balls.find(b => b.id === i + 1);
              if (rb.current && targetBall) {
                  rb.current.setTranslation(targetBall.position, true);
                  rb.current.setLinvel({x: 0, y: 0, z: 0}, true);
                  rb.current.setAngvel({x: 0, y: 0, z: 0}, true);
                  rb.current.wakeUp();
                  syncedCount++;
              }
          });
          console.log(`Synced ${syncedCount} targets out of ${rbTargets.length}`);
      }, 0);
  };

  return {
    velA, 
    setVelA,
    momA, 
    currentPosA,
    isStopped: gameState !== 'MOVING',
    syncBalls
  };
}

