
interface LaunchCueProps {
  position: [number, number, number];
  angle: number; // in degrees
  force: number; // For visual pull-back
  visible?: boolean;
  onPointerDown?: (e : any) => void;
}

export function LaunchCue({ position, angle, force, visible = true, onPointerDown }: LaunchCueProps) {
  if (!visible) return null;

  // Convert angle to radians
  const rotationY = -angle * (Math.PI / 180); 
  
  // Visual pull-back based on force (e.g. 30m/s -> small offset, 60m/s -> 1.5m offset)
  // Max pull back = 1.5 unit
  const pullBack = Math.min((force / 60) * 1.5, 1.5);

  return (
    <group 
        position={position} 
        rotation={[0, rotationY, 0]} 
        onPointerDown={onPointerDown}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Visual Cue Stick - Move back based on force */}
      <group position={[-pullBack, 0, 0]}>
        {/* Stick body */}
        <mesh position={[-2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.12, 4, 16]} />
            <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Tip */}
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
            <meshStandardMaterial color="#FFF" />
        </mesh>
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#0000FF" /> 
        </mesh>
      </group>

      {/* Guide Line (dotted line showing path) */}
      <mesh position={[2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
         <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
         <meshBasicMaterial color="white" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
