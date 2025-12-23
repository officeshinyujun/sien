

import { HStack } from '../HStack';
import s from './style.module.scss';

export default function Header() {
    return (
        <HStack className={s.container} align="center" justify="between">
            <HStack align="center" justify="center" gap={12}>
                <div className={s.logo} />
                <img src="/SIEN-Logo.png" alt="Logo" style={{ height: '24px' }} />
            </HStack>
            <div className={s.profile}/>
        </HStack>
    );
}