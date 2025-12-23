import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/general/Input';
import Button from '../../components/general/Button';
import { VStack } from '../../components/general/VStack';
import styles from './style.module.scss';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Implement login logic here
        console.log('Login with:', nickname, password);
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1>Login</h1>
                <VStack fullWidth gap={16}>
                    <Input 
                        placeholder="Nickname" 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        className={styles.input}
                    />
                    <Input 
                        placeholder="Password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />
                </VStack>
                <Button 
                    className={styles.button}
                    onClick={handleLogin}
                >
                    Login
                </Button>
                <span className={styles.linkText}>
                    Don't have an account? 
                    <Link to="/signup">Sign up</Link>
                </span>
            </div>
        </div>
    );
}
