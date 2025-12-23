import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

export function VelocityArrow({ bodyRef, color }: { bodyRef: React.RefObject<RapierRigidBody | null>, color: string }) {
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
