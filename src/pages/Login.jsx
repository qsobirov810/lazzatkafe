import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FaLock, FaUser, FaCoffee } from 'react-icons/fa';

const Login = () => {
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, applyForWaiter, isAuthenticated } = useData();
    const navigate = useNavigate();

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/system');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        if (result.success) {
            navigate('/system');
        } else {
            setError(result.message || 'Xato yuz berdi');
        }
        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await applyForWaiter({ name: regName, phone: regPhone });
        if (result.success) {
            setSuccessMsg("Arizangiz yuborildi! Admin tasdiqlashini kuting.");
            setRegName('');
            setRegPhone('');
        } else {
            setError(result.message || 'Xato yuz berdi');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <FaCoffee size={40} color="#fff" />
                </div>
                <h1 style={styles.title}>Lazzat Kafe</h1>

                {view === 'login' ? (
                    <>
                        <p style={styles.subtitle}>Tizimga xush kelibsiz</p>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <FaUser style={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Login"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <FaLock style={styles.inputIcon} />
                                <input
                                    type="password"
                                    placeholder="Parol"
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
                                {loading ? 'Kirish...' : 'Kirish'}
                            </button>
                        </form>
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Yangi xodimmisiz?
                                <button
                                    onClick={() => { setView('register'); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
                                >
                                    Ro'yxatdan o'tish
                                </button>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p style={styles.subtitle}>Ofitsiyant bo'lib ro'yxatdan o'tish</p>

                        {successMsg ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ color: '#059669', fontSize: '1.1rem', marginBottom: '1.5rem', background: '#ecfdf5', padding: '1rem', borderRadius: '10px' }}>
                                    {successMsg}
                                </div>
                                <button
                                    onClick={() => { setView('login'); setSuccessMsg(''); }}
                                    style={styles.button}
                                >
                                    OK
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleRegister} style={styles.form}>
                                <div style={styles.inputGroup}>
                                    <FaUser style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="Ism sharifingiz"
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        style={styles.input}
                                        required
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <span style={{ ...styles.inputIcon, fontWeight: 'bold' }}>📞</span>
                                    <input
                                        type="tel"
                                        placeholder="Telefon raqami"
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
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
                                    {loading ? 'Yuborilmoqda...' : 'Ariza yuborish'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setView('login'); setError(''); }}
                                    style={{ background: 'none', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer' }}
                                >
                                    Orqaga qaytish
                                </button>
                            </form>
                        )}
                    </>
                )}
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
        // Bright tea/oriental background for Choyxona vibe
        background: `linear-gradient(rgba(245, 245, 240, 0.8), rgba(255, 255, 255, 0.95)), url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat`,
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    card: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(15px)',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
    },
    title: {
        color: '#1f2937',
        fontSize: '28px',
        margin: '0 0 10px',
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#4b5563',
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
        color: '#6b7280',
    },
    input: {
        width: '100%',
        padding: '15px 15px 15px 45px',
        borderRadius: '12px',
        border: '1px solid #d1d5db',
        background: '#ffffff',
        color: '#111827',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    error: {
        color: '#ef4444',
        fontSize: '14px',
        margin: '0',
        textAlign: 'left',
    },
    button: {
        padding: '15px',
        borderRadius: '12px',
        border: 'none',
        background: 'linear-gradient(45deg, #f59e0b, #d97706)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
    },
    buttonDisabled: {
        opacity: 0.7,
        cursor: 'not-allowed',
    },
};

export default Login;
