import { VStack } from '@/components/general/VStack';
import s from './style.module.scss';
import Header from '@/components/general/Header';
import { HStack } from '@/components/general/HStack';
import Input from '@/components/general/Input';
import Button from '@/components/general/Button';
import Room from '@/components/Main/Room';
import { type RoomProps } from '@/components/Main/Room/type';

const sampleRooms: RoomProps[] = [
  { id: '1', image: '/testBackground.png', name: '친구와 함께', playerCount: 2, maxPlayers: 4, point: 100, description: '친구들과 함께 즐기는 방', physics: { restitution: 0.8, friction: 0.1 } },
  { id: '2', image: '/testBackground.png', name: '새로운 사람들', playerCount: 1, maxPlayers: 4, point: 150, description: '새로운 사람들과 만나는 방', physics: { restitution: 0.7, friction: 0.2 } },
  { id: '3', image: '/testBackground.png', name: '레슨 방', playerCount: 3, maxPlayers: 4, point: 200, description: '레슨을 위한 전용 방', physics: { restitution: 0.9, friction: 0.05 } },
  { id: '4', image: '/testBackground.png', name: '랭킹 전용', playerCount: 4, maxPlayers: 4, point: 300, description: '랭킹 전용 방', physics: { restitution: 0.85, friction: 0.15 } },
  { id: '5', image: '/testBackground.png', name: '프로 연습', playerCount: 2, maxPlayers: 4, point: 250, description: '프로 플레이어와 함께 연습', physics: { restitution: 0.95, friction: 0.02 } },
  { id: '6', image: '/testBackground.png', name: '초보자용', playerCount: 1, maxPlayers: 4, point: 50, description: '초보자들을 위한 편안한 연습', physics: { restitution: 0.6, friction: 0.3 } },
  { id: '7', image: '/testBackground.png', name: '랭킹 전용', playerCount: 4, maxPlayers: 4, point: 300, description: '랭킹 전용 방', physics: { restitution: 0.85, friction: 0.15 } },
];  

export default function Main() {
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
          <Button className={s.createButton}>방 생성</Button>
        </HStack>
        <div className={s.roomList}>
          {sampleRooms.map(room => (
            <Room key={room.id} {...room} />
          ))}
        </div>
      </VStack>
    </VStack>
  );
}