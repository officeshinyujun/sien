import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier"
import { GrabProvider, useGrab } from "@/components/lab/GrabProvider"
import * as THREE from "three"
import { useExperimentStore } from "./useExperimentStore"
import { Ruler } from "./Ruler"

// --- Constants ---
const HISTORY_LENGTH = 200; // 그래프 데이터 길이

// --- Types ---
interface ExtendedRapierRigidBody extends RapierRigidBody {
  setAdditionalMass: (mass: number, wakeUp: boolean) => void;
}

// --- Components ---

function VelocityArrow({ bodyRef, color }: { bodyRef: React.RefObject<RapierRigidBody | null>, color: string }) {
  const arrowRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (bodyRef.current && arrowRef.current) {
      const vel = bodyRef.current.linvel();
      const velocity = new THREE.Vector3(vel.x, vel.y, vel.z);
      const speed = velocity.length();

      // 화살표 방향 설정
      if (speed > 0.1) {
        const dir = velocity.normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        arrowRef.current.quaternion.copy(quaternion);
        
        // 화살표 길이 = 속도에 비례
        const scale = Math.min(speed * 0.5, 5); // 너무 길어지지 않게 제한
        arrowRef.current.scale.set(1, scale, 1);
        arrowRef.current.visible = true;
      } else {
        arrowRef.current.visible = false;
      }
      
      // 위치 동기화 (구의 중심)
      const pos = bodyRef.current.translation();
      arrowRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  return (
    <group ref={arrowRef}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

interface SphereProps {
  position: [number, number, number];
  color: string;
  mass: number;
  restitution: number;
  label: string;
  onUpdate: (vel: THREE.Vector3) => void;
  rBodyRef: React.RefObject<RapierRigidBody | null>;
}

function ExperimentSphere({ position, color, mass, restitution, label, onUpdate, rBodyRef }: SphereProps) {
  
  // Mass 업데이트
  useEffect(() => {
    if (rBodyRef.current) {
      const body = rBodyRef.current as ExtendedRapierRigidBody;
      if (typeof body.setAdditionalMass === 'function') {
         body.setAdditionalMass(mass, true);
      }
    }
  }, [mass]);

  useFrame(() => {
    if (rBodyRef.current) {
      const v = rBodyRef.current.linvel();
      onUpdate(new THREE.Vector3(v.x, v.y, v.z));
    }
  });

  return (
    <>
      <RigidBody
        ref={rBodyRef}
        colliders="ball"
        position={position}
        restitution={restitution}
        friction={0} // 마찰력 0 (운동량 보존 실험용)
        linearDamping={0} // 공기 저항 0
        angularDamping={0}
      >
        <mesh 
          castShadow 
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
        </mesh>
        <Html position={[0, 1.5, 0]} center pointerEvents="none">
          <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>
            {label}<br/>
            {mass}kg
          </div>
        </Html>
      </RigidBody>
      <VelocityArrow bodyRef={rBodyRef} color={color} />
    </>
  );
}

// --- Graph Component ---
function DataGraph({ dataA, dataB }: { dataA: number[], dataB: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Background Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2); // Zero line
    ctx.stroke();

    const drawLine = (data: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const step = width / HISTORY_LENGTH;
      
      data.forEach((val, i) => {
        // Scale: 1 unit speed = 20 pixels
        const y = (height / 2) - (val * 20); 
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * step, y);
      });
      ctx.stroke();
    };

    drawLine(dataA, '#ff5555'); // Red
    drawLine(dataB, '#5555ff'); // Blue

  }, [dataA, dataB]);

  return (
    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
      <div style={{ color: 'white', marginBottom: '5px', fontSize: '12px' }}>Speed vs Time</div>
      <canvas ref={canvasRef} width={300} height={100} />
    </div>
  );
}

// --- Main Scene ---

function Scene() {
  const { isDragging } = useGrab();
  const [isUIHovered, setIsUIHovered] = useState(false);

  // Use Store
  const { 
    massA, setMassA, 
    massB, setMassB, 
    restitution, setRestitution, 
    launchForce, setLaunchForce,
    posA, setPosA,
    posB, setPosB,
    resetKey, triggerReset
  } = useExperimentStore();
  
  // Real-time Data Refs
  const rbA = useRef<RapierRigidBody>(null);
  const rbB = useRef<RapierRigidBody>(null);
  
  const [velA, setVelA] = useState(new THREE.Vector3());
  const [velB, setVelB] = useState(new THREE.Vector3());
  
  // Graph Data
  const [historyA, setHistoryA] = useState<number[]>(new Array(HISTORY_LENGTH).fill(0));
  const [historyB, setHistoryB] = useState<number[]>(new Array(HISTORY_LENGTH).fill(0));

  // Position updates (Setup Mode) - only when sliders change
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

  // Reset / Launch Action
  useEffect(() => {
    if (resetKey === 0) return; // 초기 실행 방지 (원한다면)

    if (rbA.current && rbB.current) {
      // Launch A
      rbA.current.setTranslation({ x: posA, y: 0.5, z: 0 }, true);
      rbA.current.setLinvel({ x: launchForce, y: 0, z: 0 }, true); 
      rbA.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Reset B
      rbB.current.setTranslation({ x: posB, y: 0.5, z: 0 }, true);
      rbB.current.setLinvel({ x: 0, y: 0, z: 0 }, true); 
      rbB.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [resetKey]); // posA, posB, launchForce are captured from store scope

  // Data update loop
  useEffect(() => {
    const interval = setInterval(() => {
        setHistoryA(prev => [...prev.slice(1), velA.length()]);
        setHistoryB(prev => [...prev.slice(1), velB.length()]);
    }, 50); // 20 FPS graph update
    return () => clearInterval(interval);
  }, [velA, velB]);

  // Calculations
  const momA = velA.clone().multiplyScalar(massA);
  const momB = velB.clone().multiplyScalar(massB);
  const totalMom = momA.clone().add(momB);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        
        {/* Floor & Walls */}
        <RigidBody type="fixed" friction={0} restitution={restitution} colliders="cuboid">
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

        {/* Ruler */}
        <Ruler length={32} zPos={2} />

        {/* Spheres */}
        <ExperimentSphere 
          label="A"
          position={[posA, 0.5, 0]} 
          color="#ff5555" 
          mass={massA} 
          restitution={restitution}
          onUpdate={setVelA}
          rBodyRef={rbA}
        />
        
        <ExperimentSphere 
          label="B"
          position={[posB, 0.5, 0]} 
          color="#5555ff" 
          mass={massB} 
          restitution={restitution}
          onUpdate={setVelB}
          rBodyRef={rbB}
        />

      </Physics>

      <OrbitControls makeDefault enabled={!isDragging && !isUIHovered} />

      {/* UI Overlay */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div 
            style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}
            onPointerEnter={() => setIsUIHovered(true)}
            onPointerLeave={() => setIsUIHovered(false)}
        >
            
            {/* Controls */}
            <div style={{ background: 'rgba(255,255,255,0.9)', padding: '15px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Experiment Controls</h3>
                
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#d32f2f' }}>Mass A: {massA}kg</label>
                    <input type="range" min="0.1" max="10" step="0.1" value={massA} onChange={e => setMassA(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#d32f2f' }}>Pos A: {posA}m</label>
                    <input type="range" min="-14" max="-2" step="0.5" value={posA} onChange={e => setPosA(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#303f9f' }}>Mass B: {massB}kg</label>
                    <input type="range" min="0.1" max="10" step="0.1" value={massB} onChange={e => setMassB(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#303f9f' }}>Pos B: {posB}m</label>
                    <input type="range" min="2" max="14" step="0.5" value={posB} onChange={e => setPosB(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Restitution (Bounciness): {restitution}</label>
                    <div style={{ fontSize: '10px', color: '#666' }}>1.0 = Elastic, 0.0 = Inelastic</div>
                    <input type="range" min="0" max="1" step="0.1" value={restitution} onChange={e => setRestitution(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Launch Force: {launchForce} m/s</label>
                    <input type="range" min="1" max="20" step="1" value={launchForce} onChange={e => setLaunchForce(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <button 
                    onClick={triggerReset}
                    style={{ width: '100%', padding: '8px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Reset / Launch
                </button>
            </div>

            {/* Stats Panel */}
            <div style={{ background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '8px', width: '300px', color: 'white' }}>
                 <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Real-time Data</h4>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', fontSize: '11px', marginBottom: '10px' }}>
                    <div></div>
                    <div style={{ color: '#ff5555', fontWeight: 'bold' }}>Sphere A</div>
                    <div style={{ color: '#5555ff', fontWeight: 'bold' }}>Sphere B</div>

                    <div>Velocity</div>
                    <div>{velA.length().toFixed(2)} m/s</div>
                    <div>{velB.length().toFixed(2)} m/s</div>

                    <div>Momentum</div>
                    <div>{momA.length().toFixed(2)}</div>
                    <div>{momB.length().toFixed(2)}</div>
                 </div>

                 <div style={{ borderTop: '1px solid #555', paddingTop: '5px', fontSize: '12px' }}>
                    <strong>Total Momentum: </strong> {totalMom.length().toFixed(2)} kg·m/s
                 </div>
            </div>

            {/* Graph */}
            <DataGraph dataA={historyA} dataB={historyB} />

        </div>
      </Html>
    </>
  )
}

export function ExperimentOneSection() {
  return (
    <Canvas
      style={{ width: "100%", height: "800px", background: "#111" }}
      shadows
      camera={{ position: [0, 15, 10], fov: 50 }}
    >
      <GrabProvider>
        <Scene />
      </GrabProvider>
    </Canvas>
  )
}
