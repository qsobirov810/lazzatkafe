import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { FaUserTie, FaCheckCircle, FaShoppingBasket, FaArrowLeft, FaTrash, FaSearch, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// --- COMPONENTS ---

const TableCard = ({ table, onClick }) => (
    <div
        onClick={() => onClick(table)}
        style={{
            backgroundColor: table.status === 'free' ? '#252525' : '#7f1d1d',
            border: `2px solid ${table.status === 'free' ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: 'var(--radius)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
        }}
    >
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{table.name}</div>
        <div style={{ marginTop: '0.5rem', color: '#aaa' }}>
            {table.status === 'free' ? 'Bo\'sh' : `Band (${table.total.toLocaleString()} so'm)`}
        </div>
    </div>
);

const CategoryFilter = ({ categories, active, onSelect }) => (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0', borderBottom: '1px solid #333' }}>
        {categories.map(cat => (
            <button
                key={cat}
                onClick={() => onSelect(cat)}
                style={{
                    background: active === cat ? 'var(--accent-color)' : 'transparent',
                    color: active === cat ? '#000' : '#fff',
                    border: active === cat ? 'none' : '1px solid #555',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold'
                }}
            >
                {cat}
            </button>
        ))}
    </div>
);

const MenuItem = ({ item, onAdd }) => (
    <div style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        alignItems: 'center'
    }}>
        <div style={{ width: '80px', height: '80px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
            {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #333, #444)' }} />
            )}
        </div>
        <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem' }}>{item.name}</h4>
            <p style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{item.price.toLocaleString()} so'm</p>
        </div>
        <button
            onClick={() => onAdd(item)}
            style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--accent-color)', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem'
            }}
        >
            +
        </button>
    </div>
);

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }) => (
    <div className="animate-fade-in" style={{
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        background: type === 'error' ? '#7f1d1d' : '#064e3b',
        color: '#fff',
        padding: '1rem 2rem',
        borderRadius: '50px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: '1rem',
        fontWeight: 'bold',
        minWidth: '300px', justifyContent: 'center'
    }}>
        {type === 'error' ? <FaTimes /> : <FaCheckCircle />}
        {message}
    </div>
);

// --- MAIN PAGE ---

const WaiterApp = () => {
    const { tables, menu, categories: ctxCategories, sendOrder, updateOrder, settings } = useData();
    const navigate = useNavigate();

    const [selectedTable, setSelectedTable] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Taomlar"); // Will update effect below
    const [cart, setCart] = useState([]);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState(null); // { message, type }

    // Waiter Identification
    const [waiterName, setWaiterName] = useState(localStorage.getItem('waiterName') || '');
    const [showNameModal, setShowNameModal] = useState(false); // Default false
    const [pendingTable, setPendingTable] = useState(null); // Table selected before name entry

    // Show Toast Helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Use Categories from Context, fallback to default if empty (though specific usage might vary)
    const categories = useMemo(() => {
        if (ctxCategories && ctxCategories.length > 0) {
            return ctxCategories.map(c => c.name);
        }
        return ["Taomlar", "Kaboblar", "Ichimliklar", "Boshqa"];
    }, [ctxCategories]);

    // Update active category if current selection is invalid
    React.useEffect(() => {
        if (categories.length > 0 && !categories.includes(activeCategory)) {
            setActiveCategory(categories[0]);
        }
    }, [categories, activeCategory]);

    // Handle Table Selection
    const handleTableClick = (table) => {
        setPendingTable(table);
        setShowNameModal(true);
    };

    // Filtered Menu

    // Filtered Menu
    const filteredMenu = menu.filter(m => {
        const matchesCategory = m.category === activeCategory;
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isAvailable = m.available !== false;

        if (searchQuery) return matchesSearch && isAvailable; // If searching, ignore category (optional, but better UX)
        return matchesCategory && isAvailable;
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

    const decreaseFromCart = (itemId) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === itemId);
            if (existing.quantity === 1) {
                return prev.filter(i => i.id !== itemId);
            }
            return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const handleSendOrder = () => {
        if (!selectedTable || cart.length === 0) return;

        if (editingOrderId) {
            updateOrder(editingOrderId, cart);
            showToast("Buyurtma yangilandi!");
        } else {
            sendOrder(selectedTable.id, cart, waiterName);
            showToast("Buyurtma yuborildi!");
        }

        // Reset
        setCart([]);
        setEditingOrderId(null);
        setSelectedTable(null);
    };

    const handleEditOrder = (order) => {
        if (window.confirm("Buyurtmani tahrirlaysizmi? Eskisi o'zgaradi.")) {
            setCart([...order.items]); // Copy items to cart
            setEditingOrderId(order.id);
        }
    };

    const handleCancelEdit = () => {
        setCart([]);
        setEditingOrderId(null);
    };

    // --- RENDER ---

    // 1. Table Selection View
    if (!selectedTable) {
        return (
            <div className="container animate-fade-in" style={{ padding: '1rem', paddingBottom: '80px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2>Stollar</h2>
                        <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>Ofitsiant: <span style={{ color: 'var(--accent-color)' }}>{waiterName}</span></p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('waiterName');
                            setWaiterName('');
                            setShowNameModal(true);
                        }}
                        style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '0.5rem 1rem', borderRadius: '8px' }}
                    >
                        Chiqish
                    </button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {tables.map(table => (
                        <TableCard key={table.id} table={table} onClick={handleTableClick} />
                    ))}
                </div>

                <WaiterNameModal
                    isOpen={showNameModal}
                    onSave={(name) => {
                        localStorage.setItem('waiterName', name);
                        setWaiterName(name);
                        setShowNameModal(false);
                        // If there was a pending table, select it now
                        if (pendingTable) {
                            setSelectedTable(pendingTable);
                            setPendingTable(null);
                        }
                    }}
                    onCancel={() => {
                        setShowNameModal(false);
                        setPendingTable(null);
                    }}
                />
            </div>
        );
    }

    // 2. Menu View
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const servicePercent = settings?.servicePercentage || 0;
    const serviceAmount = cartTotal * (servicePercent / 100);
    const finalTotal = cartTotal + serviceAmount;

    const activeTableOrders = selectedTable.orders.filter(o => o.status === 'pending'); // Assuming 'pending' means active

    return (
        <div className="container animate-fade-in" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                <button onClick={() => { setSelectedTable(null); setEditingOrderId(null); setCart([]); }} style={{ background: 'transparent', color: '#fff', fontSize: '1.2rem' }}>
                    <FaArrowLeft />
                </button>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{selectedTable.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: editingOrderId ? 'var(--accent-color)' : '#aaa' }}>
                        {editingOrderId ? 'TAHRIRLASH REJIMI' : 'Yangi Buyurtma'}
                    </span>
                </div>
            </header>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Active Orders List (Show only if not editing) */}
            {!editingOrderId && activeTableOrders.length > 0 && (
                <div style={{ padding: '1rem', background: '#222', borderBottom: '1px solid #333' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#aaa' }}>Joriy Buyurtmalar:</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                        {activeTableOrders.map((order, idx) => (
                            <button
                                key={order.id}
                                onClick={() => handleEditOrder(order)}
                                style={{
                                    background: order.printed ? '#064e3b' : '#333', // Dark Green if printed
                                    border: order.printed ? '1px solid var(--success)' : '1px solid #555',
                                    borderRadius: '8px', padding: '0.5rem',
                                    minWidth: '120px', textAlign: 'left', cursor: 'pointer',
                                    position: 'relative', overflow: 'hidden'
                                }}
                            >
                                {order.printed && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--success)', padding: '2px 4px', borderBottomLeftRadius: '4px' }}>
                                        <FaCheckDouble size={10} color="#fff" />
                                    </div>
                                )}
                                <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>#{idx + 1} - {new Date(order.timestamp).toLocaleTimeString()}</div>
                                <div style={{ fontSize: '0.7rem', color: order.printed ? '#fff' : '#aaa' }}>{order.items.length} ta taom</div>
                                <div style={{ color: order.printed ? '#fff' : 'var(--accent-color)', fontWeight: 'bold' }}>{order.total.toLocaleString()}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories & Search */}
            <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                    <input
                        type="text"
                        placeholder="Qidirish..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '0.8rem', paddingLeft: '2.5rem',
                            borderRadius: '12px', border: '1px solid #444',
                            background: '#252525', color: '#fff', fontSize: '1rem'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: '#aaa' }}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                {!searchQuery && (
                    <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />
                )}
            </div>

            {/* Menu List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredMenu.map(item => (
                    <MenuItem key={item.id} item={item} onAdd={addToCart} />
                ))}
                <div style={{ height: '100px' }}></div> {/* Spacer for cart */}
            </div>

            {/* Bottom Cart Bar */}
            {cart.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: '#222', borderTop: '1px solid #444',
                    padding: '1rem', zIndex: 20
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                        <div style={{ width: '100%' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', fontSize: '1rem', background: '#333', padding: '0.5rem', borderRadius: '8px' }}>
                                    <span style={{ flex: 1 }}>{item.name}</span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#444', borderRadius: '4px' }}>
                                            <button onClick={() => decreaseFromCart(item.id)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#fff', fontSize: '1.2rem' }}>-</button>
                                            <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#fff', fontSize: '1.2rem' }}>+</button>
                                        </div>
                                        <span style={{ minWidth: '60px', textAlign: 'right' }}>{(item.price * item.quantity).toLocaleString()}</span>
                                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', padding: '5px' }}>
                                            <FaTrash color="var(--danger)" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {editingOrderId && (
                            <button
                                onClick={handleCancelEdit}
                                style={{
                                    width: '30%', background: '#444', color: '#fff',
                                    padding: '1rem', borderRadius: 'var(--radius)',
                                    fontSize: '1rem', fontWeight: 'bold'
                                }}
                            >
                                Bekor
                            </button>
                        )}
                        <button
                            onClick={handleSendOrder}
                            style={{
                                flex: 1, background: editingOrderId ? 'var(--accent-color)' : 'var(--success)', color: editingOrderId ? '#000' : '#fff',
                                padding: '1rem', borderRadius: 'var(--radius)',
                                fontSize: '1.1rem', fontWeight: 'bold'
                            }}
                        >
                            {editingOrderId
                                ? `YANGILASH • ${(finalTotal).toLocaleString()} (${cartTotal.toLocaleString()} + ${servicePercent}%)`
                                : `YUBORISH • ${(finalTotal).toLocaleString()} (${cartTotal.toLocaleString()} + ${servicePercent}%)`}
                        </button>
                    </div>
                </div>
            )}

        </div>

    );
};

const WaiterNameModal = ({ isOpen, onSave, onCancel }) => {
    const [name, setName] = useState(localStorage.getItem('waiterName') || '');

    useEffect(() => {
        if (isOpen) {
            setName(localStorage.getItem('waiterName') || '');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000
        }}>
            <div style={{
                background: '#1e1e1e', padding: '2.5rem', borderRadius: '16px',
                width: '400px', maxWidth: '90%', textAlign: 'center', border: '1px solid #444',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
                    <FaUserTie size={50} />
                </div>
                <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Ofitsiant Ismi</h2>
                <p style={{ color: '#888', marginBottom: '2rem' }}>Iltimos, ismingizni kiriting:</p>

                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ismingiz..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSave(name)}
                    style={{
                        width: '100%', padding: '1rem', marginBottom: '1.5rem',
                        borderRadius: '12px', border: '1px solid #333',
                        background: '#252525', color: '#fff', fontSize: '1.1rem',
                        textAlign: 'center', outline: 'none'
                    }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1, padding: '1rem',
                            background: '#333', color: '#fff',
                            border: '1px solid #555', borderRadius: '12px',
                            fontSize: '1rem', cursor: 'pointer'
                        }}
                    >
                        BEKOR QILISH
                    </button>
                    <button
                        onClick={() => name.trim() && onSave(name)}
                        disabled={!name.trim()}
                        style={{
                            flex: 1, padding: '1rem',
                            background: name.trim() ? 'var(--accent-color)' : '#333',
                            color: name.trim() ? '#000' : '#666',
                            border: 'none', borderRadius: '12px',
                            fontWeight: 'bold', fontSize: '1rem',
                            cursor: name.trim() ? 'pointer' : 'not-allowed',
                            transition: '0.2s'
                        }}
                    >
                        DAVOM ETISH
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaiterApp;
