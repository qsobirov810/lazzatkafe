import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { FaCashRegister, FaUtensils, FaHistory, FaCheck, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminApp = () => {
    const { tables, checkoutTable, completedOrders, archives, menu, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, deleteCategory, clearHistory, closeDay } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cashier'); // cashier, menu, categories, history
    const [selectedTable, setSelectedTable] = useState(null); // We need direct socket access for categories or add to context. Better: add to context.
    // For now, let's assume we can get categories from db.json via init_data in context.
    // Wait, context doesn't expose categories yet. Let's fix Context first or hack it here.
    // Actually, I should update Context to provide categories.
    // But for speed, I will update Context concurrently or just fetch it.

    // Correction: I should update DataContext first.
    // Let's assume DataContext *will* provide categories in next steps.
    // I'll add `categories` to the destructuring.

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginRole, setLoginRole] = useState('cashier'); // 'cashier' or 'admin' 
    const [userRole, setUserRole] = useState(''); // The authenticated role

    const handleLogin = () => {
        if (loginRole === 'cashier' && password === '1111') {
            setUserRole('cashier');
            setActiveTab('cashier');
            setIsAuthenticated(true);
        } else if (loginRole === 'admin' && password === '8888') {
            setUserRole('admin');
            setActiveTab('menu');
            setIsAuthenticated(true);
        } else {
            alert("Parol noto'g'ri!");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <h1 style={{ color: 'var(--accent-color)' }}>Admin Tizim</h1>

                {/* Role Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        onClick={() => { setLoginRole('cashier'); setPassword(''); }}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', background: loginRole === 'cashier' ? 'var(--accent-color)' : '#333', color: loginRole === 'cashier' ? '#000' : '#888', fontWeight: 'bold' }}
                    >
                        Kassir
                    </button>
                    <button
                        onClick={() => { setLoginRole('admin'); setPassword(''); }}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', background: loginRole === 'admin' ? 'var(--accent-color)' : '#333', color: loginRole === 'admin' ? '#000' : '#888', fontWeight: 'bold' }}
                    >
                        Admin
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={loginRole === 'cashier' ? "Parol (1111)" : "Parol (8888)"}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #333', background: '#252525', color: '#fff', outline: 'none' }}
                    />
                    <button
                        onClick={handleLogin}
                        style={{ padding: '0 0.5rem', background: 'var(--accent-color)', borderRadius: 'var(--radius)', fontWeight: 'bold' }}
                    >
                        Kirish
                    </button>
                </div>
            </div>
        );
    }

    // --- SUB-COMPONENTS ---

    // 1. CASHIER VIEW
    const CashierView = () => {

        // Calculate Total for Table
        const getTableTotal = (table) => {
            return table.orders.reduce((sum, order) => sum + order.total, 0);
        };

        const [showPaymentModal, setShowPaymentModal] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState('Naqd');
        const [splitValues, setSplitValues] = useState({ cash: 0, card: 0, click: 0 });

        const handleCheckoutClick = () => {
            if (!selectedTable) return;
            setShowPaymentModal(true);
            setPaymentMethod('Naqd'); // Default
            setSplitValues({ cash: 0, card: 0, click: 0 }); // Reset
        };

        const handleFinalize = () => {
            let finalMethod = paymentMethod;
            const total = getTableTotal(selectedTable);

            if (paymentMethod === 'Aralash') {
                const { cash, card, click } = splitValues;
                const sum = Number(cash) + Number(card) + Number(click);
                if (sum !== total) {
                    alert(`Summa to'g'ri kelmadi! Jami: ${total.toLocaleString()}, Kiritildi: ${sum.toLocaleString()}`);
                    return;
                }
                finalMethod = `Aralash (Naqd: ${cash.toLocaleString()}, Karta: ${card.toLocaleString()}, Click: ${click.toLocaleString()})`;
            }

            // 1. Trigger Print
            window.print();

            // 2. Checkout
            checkoutTable(selectedTable.id, finalMethod);
            setShowPaymentModal(false);
            setSelectedTable(null);
        };

        const handlePrintReceipt = () => {
            window.print();
        };

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: '100%' }}>
                {/* Table Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', alignContent: 'start' }}>
                    {tables.map(table => (
                        <div
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            style={{
                                background: selectedTable?.id === table.id ? 'var(--accent-color)' : (table.status === 'free' ? '#252525' : '#451a1a'),
                                color: selectedTable?.id === table.id ? '#000' : '#fff',
                                border: `1px solid ${table.status === 'free' ? '#444' : 'var(--danger)'}`,
                                borderRadius: 'var(--radius)',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            <h3>{table.name}</h3>
                            <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                                {table.status === 'free' ? 'Bo\'sh' : 'BAND'}
                            </p>
                            {table.status === 'busy' && (
                                <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>{getTableTotal(table).toLocaleString()} so'm</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Checkout Panel */}
                <div style={{ background: '#1e1e1e', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    {selectedTable ? (
                        <>
                            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem' }}>{selectedTable.name}</h2>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
                                {selectedTable.orders.length === 0 ? (
                                    <p style={{ color: '#666' }}>Buyurtmalar yo'q</p>
                                ) : (
                                    selectedTable.orders.map((order, idx) => (
                                        <div key={order.id} style={{ marginBottom: '1rem', borderBottom: '1px dashed #333', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>Buyurtma #{idx + 1} - {new Date(order.timestamp).toLocaleTimeString()}</div>
                                            {order.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span>{item.quantity} x {item.name}</span>
                                                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                                    <span>Jami:</span>
                                    <span style={{ color: 'var(--accent-color)' }}>{getTableTotal(selectedTable).toLocaleString()} so'm</span>
                                </div>
                                <button
                                    disabled={selectedTable.status === 'free'}
                                    onClick={handleCheckoutClick}
                                    style={{
                                        width: '100%', padding: '1rem',
                                        background: selectedTable.status === 'free' ? '#333' : 'var(--success)',
                                        color: '#fff', borderRadius: '8px', fontSize: '1.2rem'
                                    }}
                                >
                                    {selectedTable.status === 'free' ? 'Stol Bo\'sh' : 'TO\'LOV QILISH'}
                                </button>
                            </div>

                            {/* PAYMENT MODAL */}
                            {showPaymentModal && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.8)', zIndex: 100,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ background: '#252525', padding: '2rem', borderRadius: 'var(--radius)', width: '400px', maxWidth: '90%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <h2>To'lov: {selectedTable.name}</h2>
                                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', color: '#fff', fontSize: '1.5rem' }}><FaTimes /></button>
                                        </div>

                                        <p style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
                                            {getTableTotal(selectedTable).toLocaleString()} so'm
                                        </p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                                            {['Naqd', 'Karta', 'Click', 'Aralash'].map(method => (
                                                <button
                                                    key={method}
                                                    onClick={() => setPaymentMethod(method)}
                                                    style={{
                                                        padding: '1rem', borderRadius: '8px', fontWeight: 'bold',
                                                        background: paymentMethod === method ? 'var(--accent-color)' : '#333',
                                                        color: paymentMethod === method ? '#000' : '#fff',
                                                        border: paymentMethod === method ? 'none' : '1px solid #444'
                                                    }}
                                                >
                                                    {method}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Split Payment Inputs */}
                                        {paymentMethod === 'Aralash' && (
                                            <div style={{ marginBottom: '2rem', background: '#333', padding: '1rem', borderRadius: '8px' }}>
                                                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid #555', paddingBottom: '0.5rem' }}>Summalarni kiriting:</h4>
                                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label>Naqd:</label>
                                                        <input
                                                            type="number"
                                                            value={splitValues.cash || ''}
                                                            onChange={e => setSplitValues({ ...splitValues, cash: Number(e.target.value) })}
                                                            style={{ width: '120px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label>Plastik (Karta):</label>
                                                        <input
                                                            type="number"
                                                            value={splitValues.card || ''}
                                                            onChange={e => setSplitValues({ ...splitValues, card: Number(e.target.value) })}
                                                            style={{ width: '120px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label>Click:</label>
                                                        <input
                                                            type="number"
                                                            value={splitValues.click || ''}
                                                            onChange={e => setSplitValues({ ...splitValues, click: Number(e.target.value) })}
                                                            style={{ width: '120px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: (splitValues.cash + splitValues.card + splitValues.click) === getTableTotal(selectedTable) ? 'var(--success)' : 'var(--danger)' }}>
                                                    Kiritildi: {(splitValues.cash + splitValues.card + splitValues.click).toLocaleString()} so'm
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={handleFinalize}
                                                style={{ flex: 1, padding: '1rem', background: 'var(--success)', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}
                                            >
                                                YOPISH VA CHOP ETISH
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER RECEIPT (Hidden on Screen) */}
                            {showPaymentModal && (
                                <div id="customer-receipt">
                                    <div className="receipt-content">
                                        <h3>KAFE EPOS</h3>
                                        <p>Mijoz Cheki</p>
                                        <hr />
                                        <div className="receipt-header">
                                            <h2>{selectedTable.name}</h2>
                                            <p>{new Date().toLocaleString()}</p>
                                        </div>
                                        <hr />
                                        <div className="receipt-items">
                                            {selectedTable.orders.flatMap(o => o.items).map((item, i) => (
                                                <div key={i} className="receipt-item">
                                                    <span>{item.quantity} x {item.name}</span>
                                                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <hr />
                                        <div className="receipt-total">
                                            <span>JAMI:</span>
                                            <span>{getTableTotal(selectedTable).toLocaleString()} so'm</span>
                                        </div>
                                        <hr />
                                        <div style={{ textAlign: 'left', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                            To'lov: {paymentMethod === 'Aralash'
                                                ? `Aralash (Naqd: ${splitValues.cash.toLocaleString()}, Karta: ${splitValues.card.toLocaleString()}, Click: ${splitValues.click.toLocaleString()})`
                                                : paymentMethod}
                                        </div>
                                        <p style={{ textAlign: 'center', marginTop: '10px' }}>Xizmatlaringiz uchun rahmat!</p>
                                    </div>
                                </div>
                            )}

                            <style>{`
                                #customer-receipt { display: none; }
                                @media print {
                                    body * { visibility: hidden; }
                                    #customer-receipt, #customer-receipt * { visibility: visible; }
                                    #customer-receipt {
                                        position: absolute; left: 0; top: 0; width: 100%;
                                        display: block; background: white; color: black;
                                        font-family: 'Courier New', monospace;
                                        padding: 10px;
                                    }
                                    .receipt-content { width: 300px; margin: 0 auto; text-align: center; }
                                    .receipt-item { display: flex; justifyContent: space-between; margin-bottom: 5px; }
                                    .receipt-total { display: flex; justifyContent: space-between; font-weight: bold; font-size: 1.2rem; }
                                    hr { border-top: 1px dashed #000; }
                                }
                            `}</style>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            Stol tanlang
                        </div>
                    )}
                </div>
            </div >
        );
    };

    // 2. MENU VIEW (CRUD)
    const MenuView = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [editId, setEditId] = useState(null);
        // Default category first one or ''
        const defaultCat = categories.length > 0 ? categories[0].name : '';
        const [formData, setFormData] = useState({ name: '', price: '', category: defaultCat, image: '' });
        const [uploading, setUploading] = useState(false);

        const handleSubmit = (e) => {
            e.preventDefault();
            const itemPayload = {
                ...formData,
                price: Number(formData.price) // Ensure price is number
            };

            if (isEditing) {
                updateMenuItem({ ...itemPayload, id: editId });
                setIsEditing(false);
                setEditId(null);
            } else {
                addMenuItem(itemPayload);
            }
            // Reset Form
            setFormData({ name: '', price: '', category: defaultCat, image: '' });
        };

        const handleEdit = (item) => {
            setIsEditing(true);
            setEditId(item.id);
            setFormData({ name: item.name, price: item.price, category: item.category, image: item.image || '' });
        };

        const handleCancel = () => {
            setIsEditing(false);
            setEditId(null);
            setFormData({ name: '', price: '', category: defaultCat, image: '' });
        };

        const handleFileChange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const uploadData = new FormData();
            uploadData.append('image', file);

            setUploading(true);
            try {
                // Using fetch to upload to our backend endpoint
                // Note: Port 3000 is backend. Frontend is 5173. We need absolute URL or proxy.
                // Assuming backend is at http://localhost:3000 based on socket config.
                const res = await fetch('http://localhost:3000/upload', {
                    method: 'POST',
                    body: uploadData,
                });
                const data = await res.json();
                if (data.filePath) {
                    setFormData(prev => ({ ...prev, image: 'http://localhost:3000' + data.filePath })); // Store full URL or use proxy
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Rasm yuklashda xatolik!");
            } finally {
                setUploading(false);
            }
        };

        return (
            <div>
                <h2>Menyu Boshqaruvi</h2>

                {/* Form */}
                <div style={{ background: '#252525', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1rem', color: isEditing ? 'var(--accent-color)' : '#fff' }}>{isEditing ? 'Tahrirlash' : 'Yangi Taom Qo\'shish'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Nomi</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Narxi</label>
                            <input
                                required
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Kategoriya</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            >
                                <option value="" disabled>Tanlang</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.3rem' }}>Rasm Yuklash</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff', fontSize: '0.8rem' }}
                            />
                            {uploading && <span style={{ fontSize: '0.7rem', color: 'orange' }}>Yuklanmoqda...</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" disabled={uploading} style={{ flex: 1, background: 'var(--success)', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold', opacity: uploading ? 0.5 : 1 }}>
                                {isEditing ? 'Saqlash' : 'Qo\'shish'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancel} style={{ background: '#444', color: '#fff', padding: '0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>
                                    Bekor
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {menu.map(item => (
                        <div key={item.id} style={{ background: '#252525', padding: '1rem', borderRadius: '8px', border: '1px solid #333', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem' }}>{item.name}</h4>
                                    <span style={{ fontSize: '0.7rem', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#aaa' }}>{item.category}</span>
                                </div>
                                {/* Use full URL for uploaded images, handle relative for pre-defined */}
                                {item.image && (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img
                                            src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `http://localhost:3000${item.image}`} // Simple heuristic
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: '0.5rem 0' }}>{Number(item.price).toLocaleString()} so'm</p>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => handleEdit(item)}
                                    style={{ flex: 1, background: '#3b82f6', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}
                                >
                                    Tahrirlash
                                </button>
                                <button
                                    onClick={() => deleteMenuItem(item.id)}
                                    style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}
                                >
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // 3. CATEGORIES VIEW
    const CategoriesView = () => {
        const [newCat, setNewCat] = useState('');

        const handleAdd = (e) => {
            e.preventDefault();
            if (newCat.trim()) {
                addCategory(newCat.trim());
                setNewCat('');
            }
        };

        return (
            <div>
                <h2>Kategoriyalar</h2>
                <div style={{ maxWidth: '600px', margin: '2rem 0' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <input
                            value={newCat}
                            onChange={e => setNewCat(e.target.value)}
                            placeholder="Yangi kategoriya nomi"
                            style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #333', background: '#252525', color: '#fff' }}
                        />
                        <button type="submit" style={{ padding: '0 2rem', background: 'var(--accent-color)', borderRadius: 'var(--radius)', fontWeight: 'bold' }}>Qo'shish</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map(cat => (
                            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#252525', borderRadius: 'var(--radius)', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem' }}>{cat.name}</span>
                                <button
                                    onClick={() => deleteCategory(cat.id)}
                                    style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px' }}
                                >
                                    O'chirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // 4. HISTORY VIEW
    const HistoryView = () => {
        const [showDailyReport, setShowDailyReport] = useState(false);
        const [dailyStats, setDailyStats] = useState({ total: 0, cash: 0, card: 0, click: 0 });

        const calculateStats = () => {
            let cash = 0, card = 0, click = 0;
            completedOrders.forEach(order => {
                const method = order.paymentMethod || 'Naqd';
                const total = order.total;

                if (method === 'Naqd') cash += total;
                else if (method === 'Karta') card += total;
                else if (method === 'Click') click += total;
                else if (method.startsWith('Aralash')) {
                    // Parse "Aralash (Naqd: 10,000, Karta: 5,000, Click: 0)"
                    // Remove commas to parse numbers
                    const clean = method.replace(/,/g, '');
                    const match = clean.match(/Naqd: (\d+).*Karta: (\d+).*Click: (\d+)/);
                    if (match) {
                        cash += Number(match[1]);
                        card += Number(match[2]);
                        click += Number(match[3]);
                    } else {
                        // Fallback if parsing fails (shouldn't happen)
                        cash += total;
                    }
                }
            });
            return { total: cash + card + click, cash, card, click };
        };

        const handleCloseDay = () => {
            const pwd = prompt("Kassani yopish uchun ADMIN parolini kiriting:");
            if (pwd === '8888') {
                const stats = calculateStats();
                setDailyStats(stats);
                setShowDailyReport(true); // Triggers render of report

                // Allow state to update then print
                setTimeout(() => {
                    window.print();
                    if (window.confirm("Kunlik hisobot chop etildimi? Tarixni tozalab, yangi kunni boshlaymizmi?")) {
                        closeDay(stats);
                        setShowDailyReport(false);
                    }
                }, 500);
            } else if (pwd !== null) {
                alert("Parol noto'g'ri!");
            }
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Sotuvlar Tarixi</h2>
                    {completedOrders.length > 0 && (
                        <button
                            onClick={handleCloseDay}
                            style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            KASSANI YOPISH (Z-Report)
                        </button>
                    )}
                </div>
                <div style={{ marginTop: '1rem' }}>
                    {completedOrders.length === 0 ? <p style={{ color: '#666' }}>Tarix bo'sh</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #555' }}>
                                    <th style={{ padding: '0.5rem' }}>Vaqt</th>
                                    <th style={{ padding: '0.5rem' }}>Stol</th>
                                    <th style={{ padding: '0.5rem' }}>Summa</th>
                                    <th style={{ padding: '0.5rem' }}>To'lov Turi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedOrders.map((order, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '0.5rem' }}>{new Date(order.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem' }}>Stol {order.tableId}</td>
                                        <td style={{ padding: '0.5rem' }}>{order.total.toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>{order.paymentMethod}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* DAILY REPORT (Hidden on Screen) */}
                {showDailyReport && (
                    <div id="daily-report">
                        <div className="receipt-content">
                            <h3>KAFE EPOS</h3>
                            <p style={{ fontWeight: 'bold' }}>KUNLIK HISOBOT (Z-REPORT)</p>
                            <p>{new Date().toLocaleDateString()}</p>
                            <hr />
                            <div className="receipt-total">
                                <span>JAMI TUSHUM:</span>
                                <span>{dailyStats.total.toLocaleString()} so'm</span>
                            </div>
                            <hr />
                            <div style={{ textAlign: 'left', margin: '1rem 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Naqd:</span>
                                    <span>{dailyStats.cash.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Karta:</span>
                                    <span>{dailyStats.card.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Click:</span>
                                    <span>{dailyStats.click.toLocaleString()}</span>
                                </div>
                            </div>
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Cheklar soni:</span>
                                <span>{completedOrders.length} ta</span>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '20px' }}>Kassa yopildi.</p>
                        </div>
                    </div>
                )}

                <style>{`
                    #daily-report { display: none; }
                    @media print {
                        #daily-report, #daily-report * { visibility: visible; }
                        #daily-report {
                            position: absolute; left: 0; top: 0; width: 100%;
                            display: block; background: white; color: black;
                            font-family: 'Courier New', monospace;
                            padding: 10px;
                            z-index: 9999;
                        }
                    }
                `}</style>
            </div>
        );
    };

    // 5. STATISTICS VIEW
    const StatsView = () => {
        const [filterType, setFilterType] = useState('today'); // today, month, year, custom
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');

        // Helper: Get all orders (History + Archives)
        const getAllOrders = () => {
            let all = [...completedOrders];
            archives.forEach(arch => {
                if (arch.orders && Array.isArray(arch.orders)) {
                    all = all.concat(arch.orders);
                }
            });
            return all;
        };

        const getFilteredOrders = () => {
            const all = getAllOrders();
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            return all.filter(order => {
                const orderDate = new Date(order.timestamp).getTime();
                const orderObj = new Date(order.timestamp);

                if (filterType === 'today') {
                    return orderDate >= startOfDay;
                } else if (filterType === 'month') {
                    return orderObj.getMonth() === now.getMonth() && orderObj.getFullYear() === now.getFullYear();
                } else if (filterType === 'year') {
                    return orderObj.getFullYear() === now.getFullYear();
                } else if (filterType === 'custom') {
                    if (!startDate || !endDate) return true;
                    const start = new Date(startDate).getTime();
                    const end = new Date(endDate).getTime() + 86400000; // Include end date
                    return orderDate >= start && orderDate < end;
                }
                return true;
            });
        };

        const filteredOrders = getFilteredOrders();

        // Calculate Totals & Payment Methods
        let totalRevenue = 0;
        let totalCash = 0;
        let totalCard = 0;
        let totalClick = 0;

        filteredOrders.forEach(order => {
            totalRevenue += order.total;
            const method = order.paymentMethod || 'Naqd';

            if (method === 'Naqd') totalCash += order.total;
            else if (method === 'Karta') totalCard += order.total;
            else if (method === 'Click') totalClick += order.total;
            else if (method.startsWith('Aralash')) {
                const clean = method.replace(/,/g, '');
                const match = clean.match(/Naqd: (\d+).*Karta: (\d+).*Click: (\d+)/);
                if (match) {
                    totalCash += Number(match[1]);
                    totalCard += Number(match[2]);
                    totalClick += Number(match[3]);
                } else {
                    totalCash += order.total; // Fallback
                }
            }
        });

        const totalOrders = filteredOrders.length;

        // Calculate Top Items
        const itemCounts = {};
        filteredOrders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (itemCounts[item.name]) {
                        itemCounts[item.name] += item.quantity;
                    } else {
                        itemCounts[item.name] = item.quantity;
                    }
                });
            }
        });

        const topItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Statistika</h2>

                    {/* Filter Controls */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#252525', padding: '0.5rem', borderRadius: '8px' }}>
                        <button
                            onClick={() => setFilterType('today')}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: filterType === 'today' ? 'var(--accent-color)' : 'transparent', color: filterType === 'today' ? '#000' : '#fff', cursor: 'pointer' }}
                        >
                            Bugun
                        </button>
                        <button
                            onClick={() => setFilterType('month')}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: filterType === 'month' ? 'var(--accent-color)' : 'transparent', color: filterType === 'month' ? '#000' : '#fff', cursor: 'pointer' }}
                        >
                            Bu oy
                        </button>
                        <button
                            onClick={() => setFilterType('year')}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: filterType === 'year' ? 'var(--accent-color)' : 'transparent', color: filterType === 'year' ? '#000' : '#fff', cursor: 'pointer' }}
                        >
                            Bu yil
                        </button>
                        <button
                            onClick={() => setFilterType('custom')}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', background: filterType === 'custom' ? 'var(--accent-color)' : 'transparent', color: filterType === 'custom' ? '#000' : '#fff', cursor: 'pointer' }}
                        >
                            Davr
                        </button>
                    </div>
                </div>

                {/* Custom Date Inputs */}
                {filterType === 'custom' && (
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', background: '#333', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>Boshlash</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>Tugash</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: 'none' }} />
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#252525', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #333' }}>
                        <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>Jami Tushum</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{totalRevenue.toLocaleString()} <span style={{ fontSize: '1rem', color: '#fff' }}>so'm</span></p>
                    </div>
                    <div style={{ background: '#252525', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #333' }}>
                        <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>Jami Cheklar</h4>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{totalOrders}</p>
                    </div>
                </div>

                {/* Payment Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: 'var(--radius)', borderLeft: '4px solid #4caf50' }}>
                        <h5 style={{ color: '#ccc', marginBottom: '0.5rem' }}>Naqd</h5>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCash.toLocaleString()}</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: 'var(--radius)', borderLeft: '4px solid #2196f3' }}>
                        <h5 style={{ color: '#ccc', marginBottom: '0.5rem' }}>Plastik (Karta)</h5>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalCard.toLocaleString()}</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: 'var(--radius)', borderLeft: '4px solid #ff9800' }}>
                        <h5 style={{ color: '#ccc', marginBottom: '0.5rem' }}>Click</h5>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalClick.toLocaleString()}</p>
                    </div>
                </div>

                <h3>
                    Top Sotilganlar
                    <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#888', marginLeft: '0.5rem' }}>
                        ({filterType === 'today' ? 'Bugun' : filterType === 'month' ? 'Bu oy' : filterType === 'year' ? 'Bu yil' : 'Tanlangan davr'})
                    </span>
                </h3>
                <div style={{ marginTop: '1rem' }}>
                    {topItems.length === 0 ? <p style={{ color: '#666' }}>Ma'lumot yo'q</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {topItems.map(([name, count], index) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', background: '#252525', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ width: '30px', height: '30px', background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '1rem' }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1, fontSize: '1.1rem' }}>{name}</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{count} ta</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 6. ARCHIVES VIEW
    const ArchivesView = () => {
        const [expandedId, setExpandedId] = useState(null);

        const toggleExpand = (id) => {
            setExpandedId(expandedId === id ? null : id);
        };

        return (
            <div>
                <h2>Eski Z-Reportlar (Arxiv)</h2>
                <div style={{ marginTop: '1rem' }}>
                    {archives.length === 0 ? <p style={{ color: '#666' }}>Arxiv bo'sh</p> : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {archives.slice().reverse().map((arch) => (
                                <div key={arch.id} style={{ background: '#252525', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <h4 style={{ color: 'var(--accent-color)' }}>{new Date(arch.date).toLocaleDateString()}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(arch.date).toLocaleTimeString()}</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '0.5rem 0', borderTop: '1px dashed #444', borderBottom: '1px dashed #444' }}>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Jami</span>
                                            <span style={{ fontWeight: 'bold' }}>{arch.summary?.total?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Naqd</span>
                                            <span>{arch.summary?.cash?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Karta</span>
                                            <span>{arch.summary?.card?.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Click</span>
                                            <span>{arch.summary?.click?.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Buyurtmalar: {arch.orders.length} ta</span>
                                        <button
                                            onClick={() => toggleExpand(arch.id)}
                                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            {expandedId === arch.id ? 'Yopish' : 'Batafsil'}
                                        </button>
                                    </div>

                                    {/* Detailed Orders Table */}
                                    {expandedId === arch.id && (
                                        <div style={{ marginTop: '1rem', background: '#222', padding: '0.5rem', borderRadius: '4px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid #444' }}>
                                                        <th style={{ padding: '0.5rem' }}>Vaqt</th>
                                                        <th style={{ padding: '0.5rem' }}>Stol</th>
                                                        <th style={{ padding: '0.5rem' }}>Buyurtma</th>
                                                        <th style={{ padding: '0.5rem' }}>Summa</th>
                                                        <th style={{ padding: '0.5rem' }}>To'lov</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {arch.orders.map((order, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                                            <td style={{ padding: '0.5rem' }}>{new Date(order.timestamp).toLocaleTimeString()}</td>
                                                            <td style={{ padding: '0.5rem' }}>Stol {order.tableId}</td>
                                                            <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ccc' }}>
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx}>{item.quantity} x {item.name}</div>
                                                                ))}
                                                            </td>
                                                            <td style={{ padding: '0.5rem' }}>{order.total.toLocaleString()}</td>
                                                            <td style={{ padding: '0.5rem', color: '#aaa', fontSize: '0.8rem' }}>{order.paymentMethod}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- LAYOUT ---
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>

            {/* Sidebar */}
            <div style={{ width: '250px', background: '#18181b', borderRight: '1px solid #333', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ color: 'var(--accent-color)', marginBottom: '2rem' }}>KAFE EPOS</h1>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {userRole === 'cashier' && (
                        <button
                            onClick={() => setActiveTab('cashier')}
                            style={{
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                background: activeTab === 'cashier' ? '#333' : 'transparent', color: '#fff'
                            }}
                        >
                            <FaCashRegister /> Kassa
                        </button>
                    )}
                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => setActiveTab('menu')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'menu' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaUtensils /> Menyu
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'categories' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaCheck /> Kategoriyalar
                            </button>
                            <button
                                onClick={() => setActiveTab('stats')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'stats' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaHistory /> Statistika
                            </button>
                        </>
                    )}
                    {userRole === 'admin' && ( // Admin Only
                        <button
                            onClick={() => setActiveTab('archives')}
                            style={{
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                background: activeTab === 'archives' ? '#333' : 'transparent', color: '#fff'
                            }}
                        >
                            <FaHistory /> Arxiv (Z-Reports)
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                            background: activeTab === 'history' ? '#333' : 'transparent', color: '#fff'
                        }}
                    >
                        <FaHistory /> Tarix
                    </button>
                </nav>

                <button
                    onClick={() => { setIsAuthenticated(false); setPassword(''); }}
                    style={{ marginTop: 'auto', padding: '1rem', background: '#333', color: '#fff', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                    <FaSignOutAlt /> Chiqish
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeTab === 'cashier' && <CashierView />}
                {activeTab === 'menu' && <MenuView />}
                {activeTab === 'categories' && <CategoriesView />}
                {activeTab === 'stats' && <StatsView />}
                {activeTab === 'history' && <HistoryView />}
                {activeTab === 'archives' && <ArchivesView />}
            </div>

        </div>
    );
};

export default AdminApp;
