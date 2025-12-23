import { useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { Physics, RapierRigidBody, RigidBody } from "@react-three/rapier"
import { GrabProvider, useGrab } from "@/components/lab/GrabProvider"
import { useExperimentStore } from "../../../stores/useExperimentStore"
import { Ruler } from "./Ruler"
import { ExperimentSphere } from "./components/ExperimentSphere"
import { DataGraph } from "./components/DataGraph"
import { useExperimentLogic } from "@/utils/useExperimentLogic"

// --- Main Scene ---

function Scene() {
  const { isDragging } = useGrab();
  const [isUIHovered, setIsUIHovered] = useState(false);

  // Store
  const { 
    massA, setMassA, 
    massB, setMassB, 
    restitution, setRestitution, 
    launchForce, setLaunchForce,
    posA, setPosA,
    posB, setPosB,
    triggerReset,
    focusedSphere, setFocusedSphere
  } = useExperimentStore();
  
  // Physics Refs
  const rbA = useRef<RapierRigidBody>(null);
  const rbB = useRef<RapierRigidBody>(null);
  
  // Logic Hook
  const { 
    setVelA, setVelB, 
    velA, velB, 
    momA, momB, 
    totalMom, 
    historyA, historyB 
  } = useExperimentLogic(rbA, rbB);

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
          onPointerDown={() => setFocusedSphere('A')}
        />
        
        <ExperimentSphere 
          label="B"
          position={[posB, 0.5, 0]} 
          color="#5555ff" 
          mass={massB} 
          restitution={restitution}
          onUpdate={setVelB}
          rBodyRef={rbB}
          onPointerDown={() => setFocusedSphere('B')}
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
            <DataGraph 
                dataA={historyA} 
                dataB={historyB} 
                focusedSphere={focusedSphere} 
                onClearFocus={() => setFocusedSphere(null)}
            />

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
