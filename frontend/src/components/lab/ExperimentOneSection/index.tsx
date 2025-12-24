import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Physics, RapierRigidBody, RigidBody, type CollisionPayload } from "@react-three/rapier"
import { GrabProvider, useGrab } from "@/components/lab/GrabProvider"
import { useExperimentStore } from "../../../stores/useExperimentStore"
import { useGameScoreStore } from "../../../stores/useGameScoreStore"
import { ExperimentSphere } from "./components/ExperimentSphere"
import { LaunchCue } from "./components/LaunchCue"
import { useExperimentLogic } from "@/utils/useExperimentLogic"
import * as THREE from "three"
import React from "react"
import { sessionsApi } from "@/api/sessions"

// --- Helper: Generate Triangle Positions ---
function getTrianglePositions(startX: number): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const rows = 5; 
    
    const radius = 0.5;
    const rowXSpacing = Math.sqrt(3) * radius * 1.01; 
    const colZSpacing = 2 * radius * 1.01;

    for (let row = 0; row < rows; row++) {
        const x = startX + row * rowXSpacing;
        for (let col = 0; col <= row; col++) {
             const z = (col - row / 2) * colZSpacing;
             positions.push(new THREE.Vector3(x, 0, z));
        }
    }
    return positions;
}

const POCKET_RADIUS = 0.75;
const POCKET_POSITIONS = [
  [-15.5, -9.5], // Top Left
  [15.5, -9.5],  // Top Right
  [-15.5, 9.5],  // Bottom Left
  [15.5, 9.5],   // Bottom Right
  [0, -9.5],     // Top Middle
  [0, 9.5]       // Bottom Middle
];

// Standard Pool Colors
const COLORS = {
    YELLOW: '#FDD017',
    BLUE: '#0000FF',
    RED: '#FF0000',
    PURPLE: '#800080',
    ORANGE: '#FFA500',
    GREEN: '#008000',
    MAROON: '#800000',
    BLACK: '#111111',
};

// Fixed Rack Configuration (Standard-ish)
// 15 balls total. 
// Row 1: 1 ball
// Row 2: 2 balls
// Row 3: 3 balls (Middle is 8-ball)
// Row 4: 4 balls
// Row 5: 5 balls
const BALL_CONFIG: { color: string, type: 'solid' | 'stripe' | 'black' }[] = [
    { color: COLORS.YELLOW, type: 'solid' }, // 1 (Tip)
    
    { color: COLORS.BLUE, type: 'solid' },   // 2
    { color: COLORS.YELLOW, type: 'stripe' }, // 9
    
    { color: COLORS.RED, type: 'solid' },    // 3
    { color: COLORS.BLACK, type: 'black' },  // 8 (Middle)
    { color: COLORS.BLUE, type: 'stripe' },  // 10
    
    { color: COLORS.PURPLE, type: 'solid' }, // 4
    { color: COLORS.RED, type: 'stripe' },   // 11
    { color: COLORS.MAROON, type: 'solid' }, // 7
    { color: COLORS.PURPLE, type: 'stripe' },// 12

    { color: COLORS.ORANGE, type: 'solid' }, // 5
    { color: COLORS.ORANGE, type: 'stripe' },// 13
    { color: COLORS.GREEN, type: 'solid' },  // 6
    { color: COLORS.GREEN, type: 'stripe' }, // 14
    { color: COLORS.MAROON, type: 'stripe' },// 15
];


import { useAuthStore } from "@/stores/useAuthStore";
import { roomsApi } from "@/api/rooms";

// --- Main Scene ---

function Scene({ sessionIdRef, roomId }: { sessionIdRef?: React.MutableRefObject<number | null>, roomId?: string }) {
  const { isDragging } = useGrab();
  const [isAiming, setIsAiming] = useState(false);
  const { user } = useAuthStore();
  
  // Store
  const {
    restitution, friction,
    launchAngle, setLaunchAngle,
    launchForce, setLaunchForce,
    posA, posB,
    setFocusedSphere,
    triggerLaunch,
    resetKey,
    balls, // Get current balls state
    gameState,
    setGameState
  } = useExperimentStore();

  // Logic Hook
  const rbA = useRef<RapierRigidBody>(null);
  // Create refs for 15 targets
  const targetRefs = useMemo(() => Array.from({ length: 15 }).map(() => React.createRef<RapierRigidBody>()), []);
  // Calculate Target Positions
  const targetPositions = useMemo(() => getTrianglePositions(posB), [posB]);

  // Logic Hook - moved up before it's used
  const { currentPosA, syncBalls, isStopped } = useExperimentLogic(rbA, targetRefs, targetPositions);

  // --- Polling Sync Logic ---
  const lastShotIdRef = useRef<number | null>(null);
  
  // Use refs for values needed inside interval to avoid re-creating interval often
  const gameStateRef = useRef(gameState);
  const syncBallsRef = useRef(syncBalls);
  
  useEffect(() => {
      gameStateRef.current = gameState;
      syncBallsRef.current = syncBalls;
  }, [gameState, syncBalls]);

  useEffect(() => {
    if (!roomId || !user) return;

    const fetchLatestShot = async () => {
        try {
            // Only poll if we are waiting (idle)
            if (gameStateRef.current !== 'WAIT') return;

            const shot = await roomsApi.getLatestShot(roomId);
            if (shot && shot.id !== lastShotIdRef.current) {
                // Check if it's a STOP shot
                if (shot.type === 'STOP') {
                    // Assuming getLatestShot returns user_id? Currently API response might NOT have user_id inside shot object directly unless backend includes it.
                    // The Shot schema has session_id, need to check if user_id is available or we need to rely on session ownership.
                    // Actually, the previous WS message had senderId. The REST API getLatestShot returns 'Shot' schema.
                    // Let's check backend schema. backend/app/schemas.py: Shot model has ball_positions, type, id, session_id.
                    // It does NOT have user_id directly. We need to fetch session to know user_id OR update backend to include user_id in Shot response.
                    // FOR NOW: Let's assume we sync everything that is newer. 
                    // To prevent overwriting my own just-saved shot:
                    // When I save, I update lastShotIdRef. So if I get back the same ID, I ignore it.
                    // So checking ID difference is enough!
                    
                    console.log("[Polling] Syncing new shot:", shot.id);
                    syncBallsRef.current(shot.ball_positions);
                    lastShotIdRef.current = shot.id;
                }
            }
        } catch (e) {
            // silent fail
        }
    };

    fetchLatestShot(); // Initial fetch
    const intervalId = setInterval(fetchLatestShot, 2000); // Poll every 2s

    return () => clearInterval(intervalId);
  }, [roomId, user]); // Minimal dependencies

  // --- Force Stop Timeout ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (gameState === 'MOVING') {
        timeoutId = setTimeout(() => {
            console.log("Force stopping after 10s timeout...");
            
            // Force Stop Physics
            if (rbA.current) {
                rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            }
            targetRefs.forEach(rb => {
                if (rb.current) {
                    rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                }
            });

            // Transition to STOPPED (will trigger save)
            setGameState('STOPPED');
        }, 10000); // 10 seconds
    }

    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [gameState, setGameState, targetRefs]);

  // --- Save Shot Logic ---
  // 1. Save LAUNCH state when we start moving
  useEffect(() => {
    if (gameState === 'MOVING') {
         if (sessionIdRef && sessionIdRef.current) {
             // Read current positions directly from Refs
             const currentBalls: any[] = [];
             if (rbA.current) {
                 const t = rbA.current.translation();
                 const r = rbA.current.rotation();
                 const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                 currentBalls.push({ id: 0, position: {x: t.x, y: t.y, z: t.z}, rotation: {x: euler.x, y: euler.y, z: euler.z} });
             }
             targetRefs.forEach((rb, i) => {
                 if (rb.current) {
                     const t = rb.current.translation();
                     const r = rb.current.rotation();
                     const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                     currentBalls.push({ id: i + 1, position: {x: t.x, y: t.y, z: t.z}, rotation: {x: euler.x, y: euler.y, z: euler.z} });
                 }
             });

             console.log("Saving Launch State...", currentBalls);
             sessionsApi.saveShot(sessionIdRef.current, currentBalls, 'LAUNCH').catch(console.error);
         }
    }
  }, [gameState, sessionIdRef, targetRefs]); // Removed balls dependency

  // 2. Save STOP state when we stop
  useEffect(() => {
    if (gameState === 'STOPPED') {
        if (sessionIdRef && sessionIdRef.current) {
            // Read current positions directly from Refs
             const currentBalls: any[] = [];
             
             // Check Cue Ball
             if (rbA.current) {
                 const t = rbA.current.translation();
                 const r = rbA.current.rotation();
                 const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                 currentBalls.push({ id: 0, position: {x: t.x, y: t.y, z: t.z}, rotation: {x: euler.x, y: euler.y, z: euler.z} });
             } else {
                 console.warn("Cue ball ref is missing during save!");
             }

             // Check Target Balls
             console.log("Checking target refs count:", targetRefs.length);
             targetRefs.forEach((rb, i) => {
                 if (rb.current) {
                     const t = rb.current.translation();
                     const r = rb.current.rotation();
                     const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w));
                     currentBalls.push({ id: i + 1, position: {x: t.x, y: t.y, z: t.z}, rotation: {x: euler.x, y: euler.y, z: euler.z} });
                 } else {
                     // This log will help identify why targets are missing
                     console.warn(`Target ball ref ${i+1} is null during save`);
                 }
             });

            console.log("Saving Stop State (Final Positions):", JSON.stringify(currentBalls, null, 2));
            console.log(`Total balls captured: ${currentBalls.length}`);
            
            sessionsApi.saveShot(sessionIdRef.current, currentBalls, 'STOP').then((savedShot) => {
                console.log("Shot saved successfully", savedShot.id);
                lastShotIdRef.current = savedShot.id; 
                setGameState('WAIT');
            }).catch(e => {
                console.error("Failed to save shot", e);
                setGameState('WAIT');
            });
        } else {
            setGameState('WAIT');
        }
    }
  }, [gameState, sessionIdRef, setGameState, targetRefs]);

  const { addPocketedBall, resetScore } = useGameScoreStore();
  
  const cueBallMass = 0.02;
  const targetBallMass = 0.02;

  // Visibility State
  const [activeTargets, setActiveTargets] = useState<boolean[]>(new Array(15).fill(true));
  const [activeCue, setActiveCue] = useState(true);

  // Reset visibility when resetKey changes
  useEffect(() => {
    // Batch state updates together
    const timer = setTimeout(() => {
      setActiveTargets(new Array(15).fill(true));
      setActiveCue(true);
      resetScore();
    }, 0);
    
    // Cleanup function to clear the timeout if component unmounts
    return () => clearTimeout(timer);
  }, [resetKey, resetScore]);

  const handlePocketEnter = (e: CollisionPayload) => {
    // Check collision with sensor
    const userData = e.other.rigidBodyObject?.userData;
    if (userData) {
        setTimeout(() => {
            if (userData.type === 'cue') {
                // Respawn Cue Ball immediately
                if (rbA.current) {
                    rbA.current.setTranslation({ x: posA, y: 0, z: 0 }, true);
                    rbA.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
                    rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
                }
            } else if (userData.type === 'target') {
                const index = userData.index;
                setActiveTargets(prev => {
                    const next = [...prev];
                    // Only update if it wasn't already pocketed to avoid duplicate store entries (though store handles it too)
                    if (next[index]) {
                    next[index] = false;
                    const ballConfig = BALL_CONFIG[index];
                    addPocketedBall({
                        index: index,
                        color: ballConfig.color,
                        type: ballConfig.type
                    });
                    }
                    return next;
                });
            }
        }, 0);
    }
  };
  
  // Interaction Handlers
  React.useEffect(() => {
    if (!isAiming) return;

    const handlePointerMove = (e: PointerEvent) => {
        // Sensitivity
        setLaunchAngle(launchAngle - e.movementX * 0.5);
    };

    const handleWheel = (e: WheelEvent) => {
        // Scroll up (negative deltaY) -> Increase force
        // Scroll down (positive deltaY) -> Decrease force
        const delta = e.deltaY > 0 ? -1 : 1;
        // Clamp force between 5 and 60
        setLaunchForce(Math.min(60, Math.max(5, launchForce + delta)));
    };

    const handlePointerUp = () => {
        setIsAiming(false);
        // Launch on release with currently set force
        triggerLaunch();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('wheel', handleWheel);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isAiming, launchAngle, launchForce, setLaunchAngle, setLaunchForce, triggerLaunch]);


  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        
        {/* Floor & Walls */}
        <RigidBody type="fixed" friction={friction} restitution={restitution} colliders="cuboid">
          {/* Floor */}
          <mesh receiveShadow position={[0, -1, 0]}>
            <boxGeometry args={[33, 1, 21]} />
            <meshStandardMaterial color="#3a66f8" />
          </mesh>
          
          {/* Side Walls */}
          <mesh position={[0, 0.5, -10]} receiveShadow>
             <boxGeometry args={[32, 2, 1]} />
             <meshStandardMaterial color="#333" />
          </mesh>
           <mesh position={[0, 0.5, 10]} receiveShadow>
             <boxGeometry args={[32, 2, 1]} />
             <meshStandardMaterial color="#333" />
          </mesh>

          {/* End Walls */}
          <mesh position={[-16, 0.5, 0]} receiveShadow>
             <boxGeometry args={[1, 2, 21]} />
             <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[16, 0.5, 0]} receiveShadow>
             <boxGeometry args={[1, 2, 21]} />
             <meshStandardMaterial color="#333" />
          </mesh>
        </RigidBody>

        {/* Pockets */}
        {POCKET_POSITIONS.map((pos, i) => (
            <RigidBody 
                key={`pocket-${i}`} 
                type="fixed" 
                sensor 
                position={[pos[0], -0.4, pos[1]]} // Slightly raised to intersect ball
                onIntersectionEnter={handlePocketEnter}
            >
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[POCKET_RADIUS, 32]} />
                    <meshStandardMaterial color="#284fcc" transparent opacity={0.8} />
                </mesh>
            </RigidBody>
        ))}

        {/* Launch Cue */}
        {/* Position follows the ball A (currentPosA) */}
        {/* Only show if activeCue is true (and stopped) */}
        { activeCue && (
            <LaunchCue 
                position={[currentPosA.x, currentPosA.y, currentPosA.z]} 
                angle={launchAngle} 
                force={launchForce} // Always show current set force
                visible={gameState === 'WAIT'} 
                onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    setIsAiming(true);
                }}
            />
        )}

        {/* Cue Ball (A) */}
        {(() => {
            const cueState = balls.find(b => b.id === 0);
            const cuePos: [number, number, number] = cueState 
                ? [cueState.position.x, cueState.position.y, cueState.position.z] 
                : [posA, 0, 0];
            
            return (
                <ExperimentSphere 
                  position={cuePos} 
                  color="#ffffff" 
                  mass={cueBallMass} 
                  restitution={restitution}
                  friction={friction}
                  rBodyRef={rbA}
                  onPointerDown={() => setFocusedSphere('A')}
                  enableGrab={gameState === 'WAIT'}
                  userData={{ type: 'cue' }}
                  visible={activeCue}
                  type="cue"
                />
            );
        })()}
        
        {/* Target Balls (B Group) */}
        {targetPositions.map((pos, i) => {
             const ballState = balls.find(b => b.id === i + 1);
             const currentPos: [number, number, number] = ballState 
                ? [ballState.position.x, ballState.position.y, ballState.position.z] 
                : [pos.x, pos.y, pos.z];

             return (
                 <ExperimentSphere 
                    key={i}
                    position={currentPos} 
                    color={BALL_CONFIG[i]?.color || '#fff'} 
                    mass={targetBallMass} 
                    restitution={restitution}
                    friction={friction}
                    rBodyRef={targetRefs[i]}
                    onPointerDown={() => setFocusedSphere('B')}
                    enableGrab={gameState === 'WAIT'}
                    userData={{ type: 'target', index: i }}
                    visible={activeTargets[i]}
                    type={BALL_CONFIG[i]?.type || 'solid'}
                />
             );
        })}

      </Physics>  

      <OrbitControls makeDefault enabled={!isDragging && !isAiming} />
    </>
  )
}

export function ExperimentOneSection({ sessionIdRef, roomId }: { sessionIdRef?: React.MutableRefObject<number | null>, roomId?: string }) {
  return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: "#111", overflow: 'hidden' }}>
            <Canvas
                shadows
                camera={{ position: [0, 15, 10], fov: 50 }}
            >
                <GrabProvider>
                    <Scene sessionIdRef={sessionIdRef} roomId={roomId} />
                </GrabProvider>
            </Canvas>
        </div>
  )
}