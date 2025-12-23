import { VStack } from '@/components/general/VStack';
import s from './style.module.scss';
import { type RoomProps } from './type';
import { HStack } from '@/components/general/HStack';
import Button from '@/components/general/Button';
import trophyImage from "@/assets/trophy.png"

import { useNavigate } from 'react-router-dom';

export default function Room({ id, name, playerCount, point, maxPlayers, description, image }: RoomProps) {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(`/lab/${id}`);
  };

  return (
    <VStack align="center" justify="end" className={s.container} style={{ backgroundImage: `url(${image})` }}>
      <VStack className={s.contents} fullWidth align="start" justify="start" gap={8}>
        <h1>{name}</h1>
        <h2>{description}</h2>
        <HStack className={s.infoRow} fullWidth justify="between" align="center">
            <HStack gap={4} align="center" justify="start">
                <img src={trophyImage} alt="trophy" width={20} height={20} />
                <h6>{point}P</h6>
            </HStack>
            <p>{playerCount}/{maxPlayers}</p>
        </HStack>
        <Button className={s.joinButton} onClick={handleJoin}>참가하기</Button>
      </VStack>
    </VStack>
  );
}