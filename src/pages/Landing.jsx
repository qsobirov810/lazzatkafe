import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserTie, FaCashRegister } from 'react-icons/fa';

const Landing = () => {
    return (
        <div className="container flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>Kafe Epos</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Tizimga kirish uchun rolni tanlang:</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px' }}>

                <Link to="/waiter" style={cardStyle}>
                    <FaUserTie size={40} color="var(--accent-color)" />
                    <h3>Ofitsiant</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Buyurtma olish</p>
                </Link>

                <Link to="/admin" style={cardStyle}>
                    <FaCashRegister size={40} color="#3b82f6" />
                    <h3>Kassa / Admin</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Hisob-kitob</p>
                </Link>

            </div>
        </div>
    );
};

const cardStyle = {
    background: 'var(--bg-secondary)',
    padding: '2rem',
    borderRadius: 'var(--radius)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid var(--border-color)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
};

export default Landing;
