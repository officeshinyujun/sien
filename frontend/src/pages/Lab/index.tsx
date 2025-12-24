import s from "./style.module.scss"
import { VStack } from "@/components/general/VStack"
import { ExperimentOneSection } from "@/components/lab/ExperimentOneSection"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useMemo, useRef, useState } from "react"
import { sampleRooms } from "@/constants/rooms"
import { useExperimentStore } from "@/stores/useExperimentStore"
import Header from "@/components/general/Header"
import { HStack } from "@/components/general/HStack"
import trophyImage from "@/assets/trophy.png"
import Button from "@/components/general/Button"
import Card from "@/components/lab/Card"
import { sessionsApi } from "@/api/sessions"
import { roomsApi } from "@/api/rooms"
import { type User } from "@/api/auth"

export default function Lab() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { setRestitution, setFriction } = useExperimentStore();
  const sessionIdRef = useRef<number | null>(null);
  
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const currentRoom = useMemo(() => {
    return sampleRooms.find(r => r.id === roomId);
  }, [roomId]);

  useEffect(() => {
    if (currentRoom) {
      setRestitution(currentRoom.physics.restitution);
      setFriction(currentRoom.physics.friction);
    }
  }, [currentRoom, setRestitution, setFriction]);

  // Create Session on Mount & Fetch Users Interval
  useEffect(() => {
    if (roomId) {
        let intervalId: NodeJS.Timeout;

        const initSession = async () => {
            try {
                // Create Session
                const session = await sessionsApi.createSession(parseInt(roomId));
                sessionIdRef.current = session.id;
                
                // Fetch Users immediately
                fetchUsers();

                // Start Polling
                intervalId = setInterval(fetchUsers, 3000);

            } catch (e) {
                console.error("Failed to init session", e);
            }
        };

        const fetchUsers = async () => {
            try {
                const users = await roomsApi.getUsers(roomId);
                setActiveUsers(users);
            } catch (e) {
                console.error("Failed to fetch users", e);
            }
        };

        initSession();

        return () => {
            if (intervalId) clearInterval(intervalId);
            // Cleanup session on unmount is tricky because browser close/refresh might not trigger async well.
            // But we can try 'beforeunload' or just rely on 'Exit' button.
            // For robust cleanup, we might need a heartbeat or explicit exit.
            // Here we only handle explicit Exit button for now.
        }
    }
  }, [roomId]);

  const handleExit = async () => {
    if (sessionIdRef.current) {
        try {
            await sessionsApi.endSession(sessionIdRef.current);
        } catch (e) {
            console.error("Failed to end session", e);
        }
    }
    navigate('/');
  };

  return (
    <VStack className={s.container}>
      <Header/>
      <ExperimentOneSection sessionIdRef={sessionIdRef} roomId={roomId} />
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
          <Button className={s.exitButton} onClick={handleExit}>나가기</Button>
        </HStack>
        <HStack className={s.userList} fullWidth align="center" justify="start" gap={12}>
          {activeUsers.map(user => (
            <Card 
              key={user.id} 
              id={user.id.toString()} 
              name={user.nickname} 
              points={0} // Score logic not connected yet
              score={0} 
              profileImage={user.profile_image || "/testBackground.png"} 
            />
          ))}
        </HStack>
      </VStack>
    </VStack>
  )
}
