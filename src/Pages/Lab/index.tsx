import s from "./style.module.scss"
import { VStack } from "@/components/general/VStack"
import { ExperimentOneSection } from "@/components/lab/ExperimentOneSection"
import { useParams } from "react-router-dom"
import { useEffect, useMemo } from "react"
import { sampleRooms } from "@/constants/rooms"
import { useExperimentStore } from "@/stores/useExperimentStore"
import Header from "@/components/general/Header"
import { HStack } from "@/components/general/HStack"
import trophyImage from "@/assets/trophy.png"
import Button from "@/components/general/Button"
import TestImage from "/testBackground.png"
import Card from "@/components/lab/Card"


type UserType = {
  id: string;
  name : string;
  points: number;
  score : number;
  profileImage: string;
};


export default function Lab() {
  const { roomId } = useParams<{ roomId: string }>();
  const { setRestitution, setFriction } = useExperimentStore();

  const testUserData: UserType[] = [
    { id: "1", name: "Alice", points: 100, score: 1, profileImage: TestImage },
    { id: "2", name: "Bob", points: 80, score: 2, profileImage: TestImage },
    { id: "3", name: "Charlie", points: 90, score: 3, profileImage: TestImage }
  ];

  const currentRoom = useMemo(() => {
    return sampleRooms.find(r => r.id === roomId);
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      setRestitution(currentRoom.physics.restitution);
      setFriction(currentRoom.physics.friction);
    }
  }, [currentRoom, setRestitution, setFriction]);

  

  return (
    <VStack className={s.container}>
      <Header/>
      <ExperimentOneSection />
      <VStack className={s.infoPanel} gap={12}>
        <HStack className={s.infoPanelHeader} fullWidth align="center" justify="between">
          <VStack align="start" justify="center" gap={8}>
            <HStack align="center" justify="center" gap={10}>
              <h1>{currentRoom && `${currentRoom.name}`}</h1>  
              {currentRoom && <p>{currentRoom.description}</p>}
            </HStack>
                <HStack gap={4} align="center" justify="start">
                <img src={trophyImage} alt="trophy" width={16} height={16} />
                <h6>{currentRoom?.point || 0}P</h6>
            </HStack>
          </VStack>
          <Button className={s.exitButton}>나가기</Button>
        </HStack>
        <HStack className={s.userList} fullWidth align="center" justify="start" gap={12}>
          {testUserData.map(user => (
            <Card 
              key={user.id} 
              id={user.id} 
              name={user.name} 
              points={user.points} 
              score={user.score} 
              profileImage={user.profileImage} 
            />
          ))}
        </HStack>
      </VStack>
    </VStack>
  )
}
