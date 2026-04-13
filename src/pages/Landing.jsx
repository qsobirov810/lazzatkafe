import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebook, FaChevronRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './LandingPage.css';

const Landing = () => {
    const { menu, settings } = useData();
    const [scrolled, setScrolled] = useState(false);
    const [msgData, setMsgData] = useState({ name: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    // Default contact values
    const contactInfo = {
        phone: settings.phone || '+998 90 123 45 67',
        address: settings.address || 'Toshkent sh., Chilonzor tumani, 1-mavze',
        hours: settings.hours || 'Har kuni: 09:00 - 23:00'
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        
        // Enable scrolling for Landing page
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';

        return () => {
            window.removeEventListener('scroll', handleScroll);
            // Restore global hidden state
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        };
    }, []);

    // Get the first 6 items or items marked as highlights (if we added such a flag later)
    const menuHighlights = menu.slice(0, 6);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!msgData.name || !msgData.message) {
            setNotification({ show: true, message: 'Iltimos, ism va xabarni kiriting', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/messages`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(msgData)
            });
            const data = await res.json();
            if (data.success) {
                setNotification({ show: true, message: 'Xabaringiz muvaffaqiyatli yuborildi. Rahmat!', type: 'success' });
                setMsgData({ name: '', phone: '', message: '' });
            } else {
                setNotification({ show: true, message: data.error || 'Xatolik yuz berdi', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setNotification({ show: true, message: 'Server bilan ulanishda xato', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-content">
                    <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-color)' }}>
                        LAZZAT KAFE
                    </div>
                    <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <a href="#about">Biz haqimizda</a>
                        <a href="#menu">Menu</a>
                        <a href="#contact">Aloqa</a>
                        <Link to="/login" style={{
                            padding: '0.6rem 1.5rem',
                            background: 'var(--accent-color)',
                            color: '#000',
                            borderRadius: '30px',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            border: '2px solid var(--accent-color)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(255, 179, 0, 0.3)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--accent-color)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 179, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--accent-color)';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 179, 0, 0.3)';
                            }}
                        >
                            Tizimga kirish
                            <FaChevronRight size={12} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <p className="animate-fade-in">Xush kelibsiz</p>
                    <h1 className="animate-fade-in" style={{ animationDelay: '0.2s' }}>Lazzat Kafe</h1>
                    <div className="flex-center animate-fade-in" style={{ animationDelay: '0.4s', marginTop: '2rem' }}>
                        <a href="#menu" className="btn-premium">Menu bilan tanishish</a>
                    </div>
                </div>
            </header>

            {/* About Section */}
            <section id="about" className="container" style={{ padding: '8rem 0' }}>
                <div className="contact-grid">
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '3rem', color: 'var(--accent-color)', marginBottom: '2rem' }}>Haqiqiy Milliy Ta'm</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.8' }}>
                            Lazzat Kafe - bu nafaqat ovqatlanish joyi, balki o'zbek mehmondo'stligi va an'analarining markazidir.
                            Biz har bir taomni mehr bilan, eng sara maxsulotlardan foydalangan holda tayyorlaymiz.
                            Bizning maqsadimiz - sizga unutilmas ta'm va yuqori darajadagi xizmatni taqdim etishdir.
                        </p>
                    </div>
                    <div className="flex-center">
                        <img
                            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                            alt="Interior"
                            style={{ width: '100%', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}
                        />
                    </div>
                </div>
            </section>

            {/* Menu Highlights */}
            <section id="menu" style={{ background: 'var(--bg-secondary)', padding: '8rem 0' }}>
                <div className="container">
                    <div className="section-title">
                        <h2>Tanlangan Taomlar</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Eng mashhur va sevimli milliy taomlarimiz</p>
                    </div>
                    <div className="menu-grid">
                        {menuHighlights.length > 0 ? (
                            menuHighlights.map(item => (
                                <div key={item.id} className="menu-card">
                                    <img
                                        src={item.image.startsWith('http') ? item.image : item.image.startsWith('/') ? item.image : `/${item.image}`}
                                        alt={item.name}
                                        className="menu-img"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
                                    />
                                    <div className="menu-info">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h3>{item.name}</h3>
                                            <span className="price">{item.price.toLocaleString()} UZS</span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.category}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)' }}>Hozirda menu bo'sh.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section">
                <div className="container">
                    <div className="contact-grid">
                        <div>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent-color)' }}>Biz bilan bog'laning</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <FaPhone color="var(--accent-color)" size={24} />
                                    <div>
                                        <p style={{ fontWeight: 700 }}>Telefon</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{contactInfo.phone}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <FaMapMarkerAlt color="var(--accent-color)" size={24} />
                                    <div>
                                        <p style={{ fontWeight: 700 }}>Manzil</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{contactInfo.address}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <FaClock color="var(--accent-color)" size={24} />
                                    <div>
                                        <p style={{ fontWeight: 700 }}>Ish vaqti</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{contactInfo.hours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Savollaringiz bormi?</h3>
                            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Ismingiz"
                                    style={inputStyle}
                                    value={msgData.name}
                                    onChange={e => setMsgData({ ...msgData, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon raqamingiz"
                                    style={inputStyle}
                                    value={msgData.phone}
                                    onChange={e => setMsgData({ ...msgData, phone: e.target.value })}
                                />
                                <textarea
                                    placeholder="Xabaringiz"
                                    rows="4"
                                    style={inputStyle}
                                    value={msgData.message}
                                    onChange={e => setMsgData({ ...msgData, message: e.target.value })}
                                ></textarea>
                                <button type="submit" disabled={isSubmitting} className="btn-premium" style={{ border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                                    {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>&copy; 2024 Lazzat Kafe. Barcha huquqlar himoyalangan.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <FaInstagram size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                    <FaFacebook size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
            </footer>

            {/* Notification Modal */}
            {notification.show && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)'
                }}>
                    <div className="animate-fade-in" style={{
                        background: 'var(--bg-card)', padding: '2rem', borderRadius: '20px',
                        width: '90%', maxWidth: '400px', textAlign: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--border-color)'
                    }}>
                        {notification.type === 'success' ? (
                            <FaCheckCircle color="var(--success, #10b981)" size={60} style={{ marginBottom: '1rem' }} />
                        ) : (
                            <FaExclamationCircle color="#ef4444" size={60} style={{ marginBottom: '1rem' }} />
                        )}
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'white', lineHeight: '1.5' }}>
                            {notification.message}
                        </h3>
                        <button
                            onClick={() => setNotification({ ...notification, show: false })}
                            className="btn-premium"
                            style={{ width: '100%', marginTop: '1rem', border: 'none', cursor: 'pointer', padding: '1rem', fontWeight: 'bold' }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const inputStyle = {
    padding: '1rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none'
};

export default Landing;
