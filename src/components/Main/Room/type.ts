export interface RoomProps {
  id: string;
  image: string;
  name: string;
  playerCount: number;
  point: number;
  maxPlayers: number;
  description: string;
  physics: {
    restitution: number;
    friction: number;
  };
}