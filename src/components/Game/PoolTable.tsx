import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function PoolTable() {
  const { scene } = useGLTF("/table.glb");

  return (
    <RigidBody type="fixed" colliders="trimesh" friction={0.5} restitution={0.7}>
      <primitive object={scene} scale={[2, 2, 2]} position={[0, -2, 0]} />
    </RigidBody>
  );
}
