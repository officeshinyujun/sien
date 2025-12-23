import { HStack } from '@/components/general/HStack';
import s from './style.module.scss';
import { VStack } from '@/components/general/VStack';
import { CirclePile } from 'lucide-react';

interface CardProps {
    id: string;
    name : string;
    points: number;
    score : number;  
    profileImage: string;
}

export default function Card({ id, name, points, score, profileImage }: CardProps) {
  return (
    <HStack className={s.container} data-user-id={id} align="center" justify="between">
        <HStack align="center" justify="center" gap={16}>
            {profileImage && <img src={profileImage} alt={name} className={s.profileImage} />}
            <VStack align="start" justify="center" gap={8}>
                <h1>{name}</h1>
                <h2>Points: {points}</h2>
            </VStack>
        </HStack>
        <HStack align="center" justify="center" gap={12}>
            <p>{score}/8</p>   
            <CirclePile size={16} strokeWidth={0.6} color='#fff' />
        </HStack>
    </HStack>
  );
}