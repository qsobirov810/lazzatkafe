import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebook, FaChevronRight } from 'react-icons/fa';
import { useData } from '../context/DataContext';
import './LandingPage.css';

const Landing = () => {
    const { menu, settings } = useData();
    const [scrolled, setScrolled] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

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
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get the first 6 items or items marked as highlights (if we added such a flag later)
    const menuHighlights = menu.slice(0, 6);

    return (
        <div className="landing-container">
            {/* Navigation */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-content">
                    <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-color)' }}>
                        AFRUZA KAFE
                    </div>
                    <div className="nav-links">
                        <a href="#about">Biz haqimizda</a>
                        <a href="#menu">Menu</a>
                        <a href="#contact">Aloqa</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <p className="animate-fade-in">Xush kelibsiz</p>
                    <h1 className="animate-fade-in" style={{ animationDelay: '0.2s' }}>Afruza Kafe</h1>
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
                            Afruza Kafe - bu nafaqat ovqatlanish joyi, balki o'zbek mehmondo'stligi va an'analarining markazidir.
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
                                        src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`}
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
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Ismingiz" style={inputStyle} />
                                <input type="tel" placeholder="Telefon raqamingiz" style={inputStyle} />
                                <textarea placeholder="Xabaringiz" rows="4" style={inputStyle}></textarea>
                                <button type="button" className="btn-premium" style={{ border: 'none', cursor: 'pointer' }}>Yuborish</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>&copy; 2024 Afruza Kafe. Barcha huquqlar himoyalangan.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <FaInstagram size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                    <FaFacebook size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                </div>
            </footer>
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
