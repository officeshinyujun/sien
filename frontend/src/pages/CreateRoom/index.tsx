import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/general/Input';
import Button from '../../components/general/Button';
import { VStack } from '../../components/general/VStack';
import { HStack } from '../../components/general/HStack';
import styles from './style.module.scss';
import { roomsApi } from '../../api/rooms';
import { AxiosError } from 'axios';

export default function CreateRoom() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [point, setPoint] = useState('100');
    const [maxPlayers, setMaxPlayers] = useState('4');
    const [restitution, setRestitution] = useState('0.8');
    const [friction, setFriction] = useState('0.1');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name || !description) {
            setError('Please fill in name and description');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await roomsApi.create({
                name,
                description,
                point: parseInt(point),
                max_players: parseInt(maxPlayers),
                restitution: parseFloat(restitution),
                friction: parseFloat(friction),
            });
            navigate('/');
        } catch (err) {
            if (err instanceof AxiosError && err.response?.data?.detail) {
                 // Handle array of errors if validation fails
                 const detail = err.response.data.detail;
                 if (Array.isArray(detail)) {
                     setError(detail[0].msg);
                 } else {
                     setError(detail);
                 }
            } else {
                setError('Failed to create room');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h1>Create Room</h1>
                <VStack fullWidth gap={16}>
                    <div className={styles.inputGroup}>
                        <label>Room Name</label>
                        <Input 
                            placeholder="Enter room name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label>Description</label>
                        <Input 
                            placeholder="Enter room description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <HStack gap={16} fullWidth>
                        <div className={styles.inputGroup}>
                            <label>Max Players</label>
                            <Input 
                                type="number"
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Points</label>
                            <Input 
                                type="number"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </HStack>

                    <HStack gap={16} fullWidth>
                        <div className={styles.inputGroup}>
                            <label>Bounciness (0.0 - 1.0)</label>
                            <Input 
                                type="number"
                                step="0.1"
                                max="1"
                                min="0"
                                value={restitution}
                                onChange={(e) => setRestitution(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Friction (0.0 - 1.0)</label>
                            <Input 
                                type="number"
                                step="0.1"
                                max="1"
                                min="0"
                                value={friction}
                                onChange={(e) => setFriction(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </HStack>

                    {error && <span className={styles.errorMessage}>{error}</span>}
                </VStack>
                <HStack fullWidth gap={12}>
                    <Button 
                        className={styles.button}
                        onClick={() => navigate('/')}
                        style={{ backgroundColor: '#474747', color: '#fff' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className={styles.button}
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                </HStack>
            </div>
        </div>
    );
}
