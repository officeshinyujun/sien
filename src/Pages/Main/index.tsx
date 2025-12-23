import { VStack } from '@/components/general/VStack';
import styles from './style.module.scss';
import Input from '@/components/general/Input';
import { HStack } from '@/components/general/HStack';

export default function Main() {
  return (
    <VStack className={styles.container} gap={16}>
      <h1>Main Page</h1>
      <Input placeholder="Input" />
      <HStack gap={16}>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
        <div>dddd</div>
      </HStack>
    </VStack>
  );
}