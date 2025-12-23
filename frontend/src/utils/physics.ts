import * as THREE from "three";

/**
 * 운동량 계산 (p = mv)
 */
export const calculateMomentum = (velocity: THREE.Vector3, mass: number): THREE.Vector3 => {
  return velocity.clone().multiplyScalar(mass);
};

/**
 * 총 운동량 계산 (P_total = p1 + p2)
 */
export const calculateTotalMomentum = (momA: THREE.Vector3, momB: THREE.Vector3): THREE.Vector3 => {
  return momA.clone().add(momB);
};
