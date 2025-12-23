import { useRef, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier"
import { GrabProvider, useGrab } from "@/components/lab/GrabProvider"
import { useExperimentStore } from "../../../stores/useExperimentStore"
import { ExperimentSphere } from "./components/ExperimentSphere"
import { LaunchCue } from "./components/LaunchCue"
import { useExperimentLogic } from "@/utils/useExperimentLogic"
import * as THREE from "three"
import React from "react"

// --- Helper: Generate Triangle Positions ---
function getTrianglePositions(startX: number, spacing: number = 2.05): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [];
    const rows = 4; 
    
    const radius = 0.5;
    const rowXSpacing = Math.sqrt(3) * radius * 1.01; 
    const colZSpacing = 2 * radius * 1.01;

    let index = 0;
    for (let row = 0; row < rows; row++) {
        const x = startX + row * rowXSpacing;
        
        for (let col = 0; col <= row; col++) {
             const z = (col - row / 2) * colZSpacing;
             positions.push(new THREE.Vector3(x, 0, z));
             index++;
             if (index >= 10) break;
        }
    }
    return positions;
}

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
    triggerLaunch
  } = useExperimentStore();
  
  const cueBallMass = 0.02;
  const targetBallMass = 0.02;
  
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
  
  // Create refs for 10 targets
  const targetRefs = useMemo(() => Array.from({ length: 10 }).map(() => React.createRef<RapierRigidBody>()), []);
  
  // Logic Hook
  const { setVelA, velA, currentPosA, isStopped } = useExperimentLogic(rbA, targetRefs, targetPositions);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        
        {/* Floor & Walls */}
        <RigidBody type="fixed" friction={friction} restitution={restitution} colliders="cuboid">
          {/* Floor */}
          <mesh receiveShadow position={[0, -1, 0]}>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          
          {/* Side Walls */}
          <mesh position={[0, 0.5, -10]} receiveShadow>
             <boxGeometry args={[32, 2, 1]} />
             <meshStandardMaterial color="#444" />
          </mesh>
           <mesh position={[0, 0.5, 10]} receiveShadow>
             <boxGeometry args={[32, 2, 1]} />
             <meshStandardMaterial color="#444" />
          </mesh>

          {/* End Walls */}
          <mesh position={[-16, 0.5, 0]} receiveShadow>
             <boxGeometry args={[1, 2, 21]} />
             <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[16, 0.5, 0]} receiveShadow>
             <boxGeometry args={[1, 2, 21]} />
             <meshStandardMaterial color="#444" />
          </mesh>
        </RigidBody>

        {/* Launch Cue */}
        {/* Position follows the ball A (currentPosA) */}
        <LaunchCue 
            position={[currentPosA.x, currentPosA.y, currentPosA.z]} 
            angle={launchAngle} 
            force={launchForce} // Always show current set force
            visible={isStopped} 
            onPointerDown={(e) => {
                e.stopPropagation();
                setIsAiming(true);
            }}
        />

        {/* Cue Ball (A) */}
        <ExperimentSphere 
          position={[posA, 0, 0]} 
          color="#ff5555" 
          mass={cueBallMass} 
          restitution={restitution}
          friction={friction}
          onUpdate={setVelA}
          rBodyRef={rbA}
          onPointerDown={() => setFocusedSphere('A')}
          enableGrab={isStopped}
        />
        
        {/* Target Balls (B Group) */}
        {targetPositions.map((pos, i) => (
             <ExperimentSphere 
                key={i}
                position={[pos.x, pos.y, pos.z]} 
                color="#5555ff" 
                mass={targetBallMass} 
                restitution={restitution}
                friction={friction}
                rBodyRef={targetRefs[i]}
                onPointerDown={() => setFocusedSphere('B')}
                enableGrab={isStopped}
            />
        ))}

      </Physics>

      <OrbitControls makeDefault enabled={!isDragging && !isAiming} />
    </>
  )
}

export function ExperimentOneSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100%', height: '600px', background: "#111", borderRadius: '8px', overflow: 'hidden' }}>
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
