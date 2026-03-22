import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FaShoppingCart, FaPlus, FaMinus, FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import './QRMenu.css';

const QRMenu = () => {
    const { tableId } = useParams();
    const { menu, categories, tables, sendOrder, isConnected } = useData();
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Barchasi');
    const [showCart, setShowCart] = useState(false);
    const [orderStatus, setOrderStatus] = useState(null); // 'sending', 'success'
    const [searchQuery, setSearchQuery] = useState('');

    const table = tables.find(t => t.id === tableId) || { name: `Stol ${tableId}` };

    const filteredMenu = menu.filter(item => {
        const matchesCategory = activeCategory === 'Barchasi' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const available = item.available !== false;
        return matchesCategory && matchesSearch && available;
    });

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing.quantity === 1) {
                return prev.filter(i => i.id !== id);
            }
            return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
        });
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        setOrderStatus('sending');

        // Items formatted for sendOrder
        const orderItems = cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
        }));

        sendOrder(tableId, orderItems, 'Online (QR)');

        setTimeout(() => {
            setOrderStatus('success');
            setCart([]);
            setShowCart(false);
        }, 1000);
    };

    if (orderStatus === 'success') {
        return (
            <div className="status-screen flex-center" style={{ flexDirection: 'column', height: '100vh', background: '#121212', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                <FaCheckCircle size={80} color="var(--success)" style={{ marginBottom: '2rem' }} />
                <h1>Buyurtmangiz Qabul Qilindi!</h1>
                <p style={{ margin: '1rem 0', color: '#aaa' }}>Tez orada {table.name}ga yetkazib beramiz.</p>
                <button className="btn-premium" onClick={() => setOrderStatus(null)} style={{ marginTop: '2rem' }}>Yana buyurtma berish</button>
            </div>
        );
    }

    return (
        <div className="qr-container">
            {/* Header */}
            <header className="qr-header">
                <div className="container header-content">
                    <div className="header-info">
                        <h1>Lazzat Kafe</h1>
                        <p className="welcome-text">Menyuga xush kelibsiz</p>
                    </div>
                    {!isConnected && <span className="offline-badge">Offline</span>}
                </div>
            </header>

            {/* Categories */}
            <div className="cat-scroll-container">
                <div className="container cat-scroll">
                    <button
                        className={`cat-btn ${activeCategory === 'Barchasi' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('Barchasi')}
                    >
                        Barchasi
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`cat-btn ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="container" style={{ marginTop: '1rem' }}>
                <input
                    type="text"
                    placeholder="Taom qidirish..."
                    className="qr-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Menu Grid */}
            <main className="container menu-section" style={{ paddingBottom: '100px' }}>
                <div className="qr-menu-grid">
                    {filteredMenu.length > 0 ? (
                        filteredMenu.map(item => {
                            const inCart = cart.find(i => i.id === item.id);
                            return (
                                <div key={item.id} className="qr-menu-card">
                                    <div className="qr-img-wrapper">
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `http://${window.location.hostname}:3000${item.image}`}
                                            alt={item.name}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
                                        />
                                    </div>
                                    <div className="qr-info">
                                        <h3>{item.name}</h3>
                                        <p className="qr-price">{item.price.toLocaleString()} UZS</p>

                                        <div className="qr-actions">
                                            {inCart ? (
                                                <div className="cart-control">
                                                    <button onClick={() => removeFromCart(item.id)}><FaMinus /></button>
                                                    <span>{inCart.quantity}</span>
                                                    <button onClick={() => addToCart(item)}><FaPlus /></button>
                                                </div>
                                            ) : (
                                                <button className="add-btn" onClick={() => addToCart(item)}>Qo'shish</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#666', padding: '2rem' }}>Hech narsa topilmadi.</p>
                    )}
                </div>
            </main>

            {/* Floating Cart Button */}
            {cartCount > 0 && (
                <div className="cart-float-bar" onClick={() => setShowCart(true)}>
                    <div className="container flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="badge">{cartCount}</div>
                            <span style={{ fontWeight: 800 }}>{cartTotal.toLocaleString()} UZS</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Savatcha <FaShoppingCart />
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            {showCart && (
                <div className="cart-modal">
                    <div className="cart-sheet animate-slide-up">
                        <div className="cart-header">
                            <button className="close-btn" onClick={() => setShowCart(false)}><FaChevronLeft /> Qaytish</button>
                            <h2>Savatcha</h2>
                        </div>

                        <div className="cart-items">
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p>{item.price.toLocaleString()} UZS</p>
                                    </div>
                                    <div className="cart-control">
                                        <button onClick={() => removeFromCart(item.id)}><FaMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => addToCart(item)}><FaPlus /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="flex-between" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
                                <span>Jami:</span>
                                <span>{cartTotal.toLocaleString()} UZS</span>
                            </div>
                            <button
                                className="btn-order"
                                onClick={handlePlaceOrder}
                                disabled={orderStatus === 'sending'}
                            >
                                {orderStatus === 'sending' ? 'Jo\'natilmoqda...' : 'BUYURTMA BERISH'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRMenu;
