import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/general/Input';
import Button from '../../components/general/Button';
import { VStack } from '../../components/general/VStack';
import styles from './style.module.scss';

export default function Signup() {
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = () => {
        if (!nickname || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        // Implement signup logic here
        console.log('Signup with:', nickname, password);
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1>Sign Up</h1>
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
                    <Input 
                        placeholder="Confirm Password" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                    />
                    {error && <span className={styles.errorMessage}>{error}</span>}
                </VStack>
                <Button 
                    className={styles.button}
                    onClick={handleSignup}
                >
                    Sign Up
                </Button>
                <span className={styles.linkText}>
                    Already have an account? 
                    <Link to="/login">Login</Link>
                </span>
            </div>
        </div>
    );
}