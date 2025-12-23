import { Text } from "@react-three/drei";
import * as THREE from "three";

export function Ruler({ length = 40, step = 1, zPos = 2 }: { length?: number, step?: number, zPos?: number }) {
  const ticks = [];
  const start = -length / 2;
  const end = length / 2;

  for (let i = start; i <= end; i += step) {
    const isMajor = i % 5 === 0;
    const tickHeight = isMajor ? 0.5 : 0.25;
    const tickColor = isMajor ? "#aaaaaa" : "#666666";

    ticks.push(
      <group key={i} position={[i, 0.01, zPos]}>
        {/* 눈금 선 */}
        <mesh position={[0, 0, tickHeight / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.05, tickHeight]} />
          <meshBasicMaterial color={tickColor} />
        </mesh>
        
        {/* 숫자 (Major tick only) */}
        {isMajor && (
          <Text
            position={[0, 0, tickHeight + 0.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.4}
            color="#dddddd"
            anchorX="center"
            anchorY="bottom"
          >
            {Math.abs(i) + "m"}
          </Text>
        )}
      </group>
    );
  }

  return (
    <group>
      {/* 기준선 (X축) */}
      <mesh position={[0, 0.01, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, 0.02]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      {ticks}
    </group>
  );
}
