import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/general/Input';
import Button from '../../components/general/Button';
import { VStack } from '../../components/general/VStack';
import styles from './style.module.scss';
import { authApi } from '../../api/auth';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../stores/useAuthStore';

export default function Login() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = async () => {
        if (!nickname || !password) {
            setError('Please enter both nickname and password');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(nickname, password);
            localStorage.setItem('access_token', response.access_token);
            
            // Fetch user info after login
            const user = await authApi.me();
            setAuth(user, response.access_token);
            
            navigate('/');
        } catch (err) {
            if (err instanceof AxiosError && err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Failed to login. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
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
                    {error && <span className={styles.errorMessage}>{error}</span>}
                </VStack>
                <Button 
                    className={styles.button}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
                <span className={styles.linkText}>
                    Don't have an account? 
                    <Link to="/signup">Sign up</Link>
                </span>
            </div>
        </div>
    );
}
