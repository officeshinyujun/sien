import { useState, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { GrabContext } from "./hooks";

export function GrabProvider({ children }: { children: React.ReactNode }) {
  const [selectedBody, setSelectedBody] = useState<React.RefObject<RapierRigidBody | null> | null>(null);
  const { camera, raycaster, pointer } = useThree();
  
  // 드래그 시점의 거리 저장을 위한 ref
  const dragDistance = useRef<number>(0);

  const grab = (ref: React.RefObject<RapierRigidBody | null>) => {
    if (ref.current) {
      setSelectedBody(ref);
      const bodyPos = ref.current.translation();
      const bodyVec = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z);
      // 카메라와 물체 사이의 거리 계산
      dragDistance.current = camera.position.distanceTo(bodyVec);
      
      // 물리 엔진의 간섭을 줄이기 위해 kinematic으로 바꿀 수도 있지만,
      // 여기서는 setTranslation을 매 프레임 강제 적용하고 속도를 0으로 만드는 방식을 사용 (Kinematic 처럼 동작)
      ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  };

  const release = () => {
    if (selectedBody?.current) {
        // 놓을 때 물리 효과 복원 (속도를 0으로 뒀으므로 그냥 떨어지거나 함)
        selectedBody.current.wakeUp();
    }
    setSelectedBody(null);
  };

  useFrame(() => {
    if (selectedBody && selectedBody.current) {
      // 마우스 포인터 업데이트
      raycaster.setFromCamera(pointer, camera);
      
      // 카메라에서 마우스 방향으로 distance만큼 떨어진 위치 계산
      const targetPos = new THREE.Vector3();
      raycaster.ray.at(dragDistance.current, targetPos);

      // RigidBody 위치 이동 (물리 연산 무시하고 강제 이동)
      // nextTranslation을 쓰거나 setTranslation 사용
      selectedBody.current.setTranslation(targetPos, true);
      selectedBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      selectedBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  // 전역적으로 pointer up 이벤트를 감지하여 드래그 종료 (Canvas 외부로 나갔을 때 등 대비)
  useEffect(() => {
    const handlePointerUp = () => {
      if (selectedBody) release();
    };
    
    const handleWheel = (e: WheelEvent) => {
      if (selectedBody) {
        // 스크롤로 거리 조절
        const MIN_DISTANCE = 2;
        const MAX_DISTANCE = 50;
        const SCROLL_SPEED = 0.01; // 스크롤 감도

        // deltaY가 양수면 멀어지고(거리 증가), 음수면 가까워짐(거리 감소)
        const newDist = dragDistance.current + e.deltaY * SCROLL_SPEED;
        dragDistance.current = Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, newDist));
      }
    }

    window.addEventListener("pointerup", handlePointerUp);
    if (selectedBody) {
        window.addEventListener("wheel", handleWheel);
    }
    
    return () => {
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("wheel", handleWheel);
    };
  }, [selectedBody]);

  return (
    <GrabContext.Provider value={{ grab, release, isDragging: !!selectedBody }}>
      {children}
    </GrabContext.Provider>
  );
}
