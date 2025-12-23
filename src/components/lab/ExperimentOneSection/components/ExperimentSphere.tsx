import { useEffect, useMemo } from "react";
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
  userData?: Record<string, any>;
  visible?: boolean;
  type?: 'solid' | 'stripe' | 'black' | 'cue';
}

function createStripeTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
      // White Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 128);
      
      // Colored Band (Middle)
      // UV y=0 is bottom, y=1 is top. Equator is y=0.5.
      // Draw from y=32 to y=96 (25% to 75% height)
      ctx.fillStyle = color;
      ctx.fillRect(0, 32, 128, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

export function ExperimentSphere({ position, color, mass, restitution, friction, onUpdate, rBodyRef, onPointerDown, enableGrab = true, userData, visible = true, type = 'solid' }: SphereProps) {
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

  // Handle Visibility (Teleport to Hell strategy)
  useEffect(() => {
    if (rBodyRef.current) {
        if (!visible) {
            // Teleport far away and stop
            rBodyRef.current.setTranslation({ x: 0, y: -100, z: 0 }, true);
            rBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            rBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
            rBodyRef.current.sleep();
        } else {
            // When becoming visible, ensure it's awake. 
            // Position reset is handled by the parent/store reset logic.
            rBodyRef.current.wakeUp();
        }
    }
  }, [visible]);

  useFrame(() => {
    if (rBodyRef.current && onUpdate) {
      const v = rBodyRef.current.linvel();
      onUpdate(new THREE.Vector3(v.x, v.y, v.z));
    }
  });

  // Texture Logic
  const texture = useMemo(() => {
    if (type === 'stripe') {
        return createStripeTexture(color);
    }
    return null;
  }, [type, color]);

  const displayColor = (type === 'stripe') ? '#ffffff' : color;

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
        userData={userData}
      >
        <mesh 
          visible={visible}
          castShadow 
          onPointerDown={(e) => {
            if (!enableGrab || !visible) return;
            e.stopPropagation();
            if (e.target) {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }
            grab(rBodyRef);
            if(onPointerDown) onPointerDown();
          }}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color={displayColor} 
            map={texture}
            metalness={0.2} 
            roughness={0.1} 
          />
        </mesh>
      </RigidBody>
    </>
  );
}
