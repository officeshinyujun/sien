import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useGrab } from "@/components/lab/GrabProvider";
import { VelocityArrow } from "./VelocityArrow";
import * as THREE from "three";

interface ExtendedRapierRigidBody extends RapierRigidBody {
  setAdditionalMass: (mass: number, wakeUp: boolean) => void;
}

interface SphereProps {
  position: [number, number, number];
  color: string;
  mass: number;
  restitution: number;
  label: string;
  onUpdate: (vel: THREE.Vector3) => void;
  rBodyRef: React.RefObject<RapierRigidBody | null>;
  onPointerDown?: () => void;
}

export function ExperimentSphere({ position, color, mass, restitution, label, onUpdate, rBodyRef, onPointerDown }: SphereProps) {
  const { grab } = useGrab();
  
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
          onPointerDown={(e) => {
            e.stopPropagation();
            if (e.target) {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }
            grab(rBodyRef);
            if(onPointerDown) onPointerDown();
          }}
        >
          <sphereGeometry args={[1, 64, 8]} />
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
