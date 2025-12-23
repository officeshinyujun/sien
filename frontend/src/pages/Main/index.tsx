import { VStack } from '@/components/general/VStack';
import s from './style.module.scss';
import Header from '@/components/general/Header';
import { HStack } from '@/components/general/HStack';
import Input from '@/components/general/Input';
import Button from '@/components/general/Button';
import Room from '@/components/Main/Room';
import { useEffect, useState } from 'react';
import { roomsApi } from '@/api/rooms';
import { type RoomProps } from '@/components/Main/Room/type';
import { useNavigate } from 'react-router-dom';

export default function Main() {
  const [rooms, setRooms] = useState<RoomProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomsApi.getAll();
        setRooms(data);
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <VStack className={s.container} gap={16}>
      <Header/>
      <VStack className={s.content} align="center" justify="start" gap={36}>
        <VStack align="center" justify="center" gap={16} className={s.hero}>
          <h1>포켓볼을 즐기세요!</h1>
          <p>룸을 선택하여 자유롭게 플레이하세요.</p>
        </VStack>
        <HStack fullWidth align="center" justify="between">
          <Input placeholder="방 검색" className={s.searchInput} />
          <Button 
            className={s.createButton}
            onClick={() => navigate('/create-room')}
          >
            방 생성
          </Button>
        </HStack>
        <div className={s.roomList}>
          {rooms.map(room => (
            <Room key={room.id} {...room} />
          ))}
        </div>
      </VStack>
    </VStack>
  );
}