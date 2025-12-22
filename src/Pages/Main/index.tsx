import { VStack } from '@/components/VStack';
import styles from './style.module.scss';
import Input from '@/components/Input';
import { HStack } from '@/components/HStack';

export default function Main() {
  return (
    <VStack className={styles.container} gap={16}>
      <h1>Main Page</h1>
      <Input placeholder="Input" />
      <HStack>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
      </HStack>
    </VStack>
  );
}