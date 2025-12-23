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
// import { ExperimentControls } from "@/components/lab/ExperimentOneSection/components/ExperimentControls"

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


// --- Main Scene ---

function Scene() {
  const { isDragging } = useGrab();
  const [isAiming, setIsAiming] = useState(false);
  // Removed currentCharge state
  
  // Store
  const { 
    restitution, friction,
    launchAngle, setLaunchAngle,
    launchForce, setLaunchForce,
    posA, posB,
    setFocusedSphere,
    triggerLaunch,
    resetKey
  } = useExperimentStore();

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


  // Calculate Target Positions
  const targetPositions = useMemo(() => getTrianglePositions(posB), [posB]);
  
  // Physics Refs
  const rbA = useRef<RapierRigidBody>(null);
  
  // Create refs for 15 targets
  const targetRefs = useMemo(() => Array.from({ length: 15 }).map(() => React.createRef<RapierRigidBody>()), []);
  
  // Logic Hook
  const { 
    // setVelA, velA, 
    currentPosA, isStopped } = useExperimentLogic(rbA, targetRefs, targetPositions);

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
                visible={isStopped} 
                onPointerDown={(e: React.PointerEvent) => {
                    e.stopPropagation();
                    setIsAiming(true);
                }}
            />
        )}

        {/* Cue Ball (A) */}
        <ExperimentSphere 
          position={[posA, 0, 0]} 
          color="#ffffff" 
          mass={cueBallMass} 
          restitution={restitution}
          friction={friction}
          rBodyRef={rbA}
          onPointerDown={() => setFocusedSphere('A')}
          enableGrab={isStopped}
          userData={{ type: 'cue' }}
          visible={activeCue}
          type="cue"
        />
        
        {/* Target Balls (B Group) */}
        {targetPositions.map((pos, i) => (
             <ExperimentSphere 
                key={i}
                position={[pos.x, pos.y, pos.z]} 
                color={BALL_CONFIG[i]?.color || '#fff'} 
                mass={targetBallMass} 
                restitution={restitution}
                friction={friction}
                rBodyRef={targetRefs[i]}
                onPointerDown={() => setFocusedSphere('B')}
                enableGrab={isStopped}
                userData={{ type: 'target', index: i }}
                visible={activeTargets[i]}
                type={BALL_CONFIG[i]?.type || 'solid'}
            />
        ))}

      </Physics>  

      <OrbitControls makeDefault enabled={!isDragging && !isAiming} />
    </>
  )
}

export function ExperimentOneSection() {
  const { pocketedBalls, gameStatus } = useGameScoreStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%' }}>
        <div style={{ position: 'relative', width: '100%', height: '600px', background: "#111", borderRadius: '8px', overflow: 'hidden' }}>
            {/* Game Overlay */}
            <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px', 
                zIndex: 10, 
                color: 'white', 
                background: 'rgba(0,0,0,0.6)', 
                padding: '15px', 
                borderRadius: '8px',
                pointerEvents: 'none',
                fontFamily: 'sans-serif'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    Status: <span style={{ color: gameStatus === 'finished' ? '#ff4444' : '#44ff44' }}>
                        {gameStatus.toUpperCase()}
                    </span>
                </div>
                <div style={{ fontSize: '1rem' }}>
                    Pocketed: {pocketedBalls.length} / 15
                </div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap', maxWidth: '200px' }}>
                    {pocketedBalls.map((ball, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                width: '15px', 
                                height: '15px', 
                                borderRadius: '50%', 
                                background: ball.color,
                                border: ball.type === 'stripe' ? '3px solid white' : 'none',
                                boxSizing: 'border-box'
                            }} 
                        />
                    ))}
                </div>
            </div>

            {gameStatus === 'finished' && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                    color: 'white',
                    background: 'rgba(255, 0, 0, 0.8)',
                    padding: '20px 40px',
                    borderRadius: '12px',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    textAlign: 'center'
                }}>
                    GAME OVER
                    <div style={{ fontSize: '1rem', marginTop: '10px' }}>8-Ball Pocketed Early!</div>
                </div>
            )}

            <Canvas
                shadows
                camera={{ position: [0, 15, 10], fov: 50 }}
            >
                <GrabProvider>
                    <Scene />
                </GrabProvider>
            </Canvas>
        </div>
        
        {/* <ExperimentControls /> */}
    </div>
  )
}