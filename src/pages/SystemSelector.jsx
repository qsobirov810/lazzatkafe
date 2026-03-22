import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaCashRegister, FaUserShield, FaLock, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useData } from '../context/DataContext';

const SystemSelector = () => {
    const navigate = useNavigate();
    const { logout, user } = useData();
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Clear active session role when arriving at selector
        sessionStorage.removeItem('activeSessionRole');

        // Optional: If user is absolutely only a waiter, we could auto-navigate them here. 
        // But letting them click the single Waiter panel is safer for UX/logout.
    }, []);

    const handleAdminClick = (e) => {
        e.preventDefault();
        setShowPinModal(true);
        setPin('');
        setError('');
    };

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin === '8888') {
            setShowPinModal(false);
            sessionStorage.setItem('activeSessionRole', 'admin');
            navigate('/system/admin');
        } else {
            setError('Noto\'g\'ri parol!');
            setPin('');
        }
    };

    const handleCashierClick = () => {
        sessionStorage.setItem('activeSessionRole', 'cashier');
        navigate('/system/cashier');
    };

    const handleWaiterClick = () => {
        sessionStorage.setItem('activeSessionRole', 'waiter');
        navigate('/system/waiter');
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem', background: '#121212', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", position: 'relative' }}>
            
            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            >
                <FaSignOutAlt /> Chiqish
            </button>

            <h1 style={{ fontSize: '3rem', color: 'var(--accent-color, #f59e0b)', margin: 0, fontWeight: 900 }}>Lazzat Kafe</h1>
            <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '2rem' }}>Tizimga xush kelibsiz. Ish bo'limini tanlang:</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', maxWidth: '900px', padding: '0 2rem', justifyContent: 'center' }}>

                {(!user || user.role === 'admin') && (
                    <div onClick={handleAdminClick} className="selector-card" style={cardStyle}>
                        <div style={iconContainerStyle}><FaUserShield size={45} color="#fff" /></div>
                        <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: '10px 0' }}>Admin Panel</h3>
                        <p style={{ fontSize: '1rem', color: '#888', margin: 0 }}>Barcha huquqlar</p>
                    </div>
                )}

                {(!user || user.role === 'admin') && (
                    <div onClick={handleCashierClick} className="selector-card" style={cardStyle}>
                        <div style={iconContainerStyle}><FaCashRegister size={45} color="#fff" /></div>
                        <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: '10px 0' }}>Kassa</h3>
                        <p style={{ fontSize: '1rem', color: '#888', margin: 0 }}>Hisob-kitob va Chek</p>
                    </div>
                )}

                <div onClick={handleWaiterClick} className="selector-card" style={cardStyle}>
                    <div style={iconContainerStyle}><FaUserTie size={45} color="#fff" /></div>
                    <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: '10px 0' }}>Ofitsiant</h3>
                    <p style={{ fontSize: '1rem', color: '#888', margin: 0 }}>Buyurtma olish</p>
                </div>

            </div>

            {/* Admin PIN Modal */}
            {showPinModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaLock color="var(--accent-color, #f59e0b)" size={20} /> Kirish
                            </h2>
                            <button onClick={() => setShowPinModal(false)} style={closeButtonStyle}><FaTimes size={20} /></button>
                        </div>
                        <p style={{ color: '#aaa', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Admin paneliga kirish uchun parolni kiriting:</p>
                        <form onSubmit={handlePinSubmit}>
                            <input 
                                type="password" 
                                autoFocus
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                style={inputStyle}
                                placeholder="****"
                            />
                            {error && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
                            <button type="submit" style={submitBtnStyle}>Tasdiqlash</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .selector-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 40px rgba(245, 158, 11, 0.2) !important;
                    border-color: rgba(245, 158, 11, 0.5) !important;
                }
            `}</style>
        </div>
    );
};

const cardStyle = {
    background: '#1a1a1a',
    padding: '3rem 2rem',
    borderRadius: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #333',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
};

const iconContainerStyle = {
    width: '90px',
    height: '90px',
    background: 'linear-gradient(45deg, #f59e0b, #d97706)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
    marginBottom: '1rem'
};

const modalOverlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
    background: '#1a1a1a', padding: '2rem', borderRadius: '16px', width: '350px',
    border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
};

const closeButtonStyle = {
    background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', padding: 0
};

const inputStyle = {
    width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', 
    borderRadius: '10px', color: '#fff', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '8px', outline: 'none'
};

const submitBtnStyle = {
    width: '100%', padding: '1rem', background: 'var(--accent-color, #f59e0b)', color: '#000', 
    border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '1.5rem', transition: '0.2s'
};

export default SystemSelector;
