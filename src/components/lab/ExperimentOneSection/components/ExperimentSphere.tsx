import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useGrab } from "@/components/lab/GrabProvider";
import * as THREE from "three";

interface ExtendedRapierRigidBody extends RapierRigidBody {
  setAdditionalMass: (mass: number, wakeUp: boolean) => void;
}

interface SphereProps {
  position: [number, number, number];
  color: string;
  mass: number;
  restitution: number;
  friction: number;
  onUpdate?: (vel: THREE.Vector3) => void;
  rBodyRef: React.RefObject<RapierRigidBody | null>;
  onPointerDown?: () => void;
  enableGrab?: boolean;
}

export function ExperimentSphere({ position, color, mass, restitution, friction, onUpdate, rBodyRef, onPointerDown, enableGrab = true }: SphereProps) {
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
    if (rBodyRef.current && onUpdate) {
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
        friction={friction} 
        linearDamping={0.2} 
        angularDamping={0.2}
      >
        <mesh 
          castShadow 
          onPointerDown={(e) => {
            if (!enableGrab) return;
            e.stopPropagation();
            if (e.target) {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }
            grab(rBodyRef);
            if(onPointerDown) onPointerDown();
          }}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.1} />
        </mesh>
      </RigidBody>
    </>
  );
}
