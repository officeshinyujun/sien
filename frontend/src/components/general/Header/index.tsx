
import { useNavigate } from 'react-router-dom';
import { HStack } from '../HStack';
import { useAuthStore } from '../../../stores/useAuthStore';
import Button from '../Button';
import s from './style.module.scss';

export default function Header() {
    const { user, isLoggedIn } = useAuthStore();
    const navigate = useNavigate();
    const isAuthed = isLoggedIn();

    return (
        <HStack className={s.container} align="center" justify="between">
            <HStack align="center" justify="center" gap={12} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <div className={s.logo} />
                <img src="/SIEN-Logo.png" alt="Logo" style={{ height: '24px' }} />
            </HStack>
            {isAuthed ? (
                <div 
                    className={s.profile} 
                    style={{ 
                        backgroundImage: user?.profile_image ? `url(http://localhost:8000${user.profile_image})` : 'none',
                        backgroundSize: 'cover'
                    }} 
                />
            ) : (
                <Button 
                    className={s.loginButton} 
                    onClick={() => navigate('/login')}
                >
                    Login
                </Button>
            )}
        </HStack>
    );
}