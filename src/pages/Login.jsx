import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FaLock, FaUserSecret } from 'react-icons/fa';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useData();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(password);
        if (result.success) {
            // navigate('/system'); // Handled by ProtectedRoute state change
        } else {
            setError(result.message || 'Xato yuz berdi');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <FaUserSecret size={50} color="#fff" />
                </div>
                <h1 style={styles.title}>Admin Panel</h1>
                <p style={styles.subtitle}>Afruza Kafe tizimiga xush kelibsiz</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <FaLock style={styles.inputIcon} />
                        <input
                            type="password"
                            placeholder="Parolni kiriting"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Kirish...' : 'Tizimga kirish'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, #e94560, #950740)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
    },
    title: {
        color: '#fff',
        fontSize: '28px',
        margin: '0 0 10px',
        fontWeight: 'bold',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        margin: '0 0 30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: '15px',
        color: 'rgba(255, 255, 255, 0.4)',
    },
    input: {
        width: '100%',
        padding: '15px 15px 15px 45px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#fff',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s ease',
    },
    error: {
        color: '#e94560',
        fontSize: '14px',
        margin: '0',
        textAlign: 'left',
    },
    button: {
        padding: '15px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(45deg, #e94560, #950740)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(233, 69, 96, 0.3)',
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },
};

export default Login;
