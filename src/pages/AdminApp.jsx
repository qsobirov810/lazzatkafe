import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { FaCashRegister, FaUtensils, FaHistory, FaCheck, FaTimes, FaSignOutAlt, FaPrint, FaTrash, FaPlus, FaEdit, FaImage, FaCamera, FaChair, FaSearch, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


// --- PRINT PORTAL COMPONENT ---
const PrintPortal = ({ children }) => {
    const mount = document.getElementById('print-root');
    const el = React.useMemo(() => document.createElement('div'), []);

    useEffect(() => {
        mount.appendChild(el);
        return () => mount.removeChild(el);
    }, [el, mount]);

    return createPortal(children, el);
};

// --- SUB-COMPONENTS ---

// 0. KITCHEN VIEW (New)
const KitchenView = () => {
    const { activeOrders, markOrderPrinted, clearKitchenHistory, cancelOrder } = useData();
    const [ticketToPrint, setTicketToPrint] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

    // Filter orders
    const displayedOrders = activeOrders.filter(order => {
        if (activeTab === 'active') return !order.printed;
        if (activeTab === 'history') return order.printed && !order.kitchenHidden;
        return true;
    });

    const handleClearHistory = () => {
        if (activeTab !== 'history') return;
        // Get all visible history items
        const historyIds = displayedOrders.map(o => o.id);
        if (historyIds.length === 0) return;

        if (window.confirm("Tarixni butunlay tozalaysizmi? (Boshqa qurilmalarda ham o'chadi)")) {
            clearKitchenHistory(historyIds);
        }
    };

    const handlePrint = (order) => {
        markOrderPrinted(order.id);
        setTicketToPrint(order);
    };

    useEffect(() => {
        if (ticketToPrint) {
            const timer = setTimeout(() => {
                window.print();
                setTicketToPrint(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [ticketToPrint]);

    const handleDelete = (order) => {
        if (window.confirm(`Haqiqatan ham Stol ${order.tableId} buyurtmasini O'CHIRMOQCHIMISIZ?`)) {
            cancelOrder(order.id);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Oshxona (Buyurtmalar)</h2>
                <div style={{ display: 'flex', gap: '1rem', background: '#252525', padding: '0.3rem', borderRadius: '8px' }}>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: 'bold',
                            background: activeTab === 'active' ? 'var(--accent-color)' : 'transparent',
                            color: activeTab === 'active' ? '#000' : '#fff'
                        }}
                    >
                        Yangi ({activeOrders.filter(o => !o.printed).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: 'bold',
                            background: activeTab === 'history' ? 'var(--accent-color)' : 'transparent',
                            color: activeTab === 'history' ? '#000' : '#fff'
                        }}
                    >
                        Tarix ({activeOrders.filter(o => o.printed && !o.kitchenHidden).length})
                    </button>
                    {activeTab === 'history' && (
                        <button
                            onClick={handleClearHistory}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold',
                                background: '#7f1d1d', color: '#fff', border: 'none', cursor: 'pointer'
                            }}
                        >
                            Tozalash
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {displayedOrders.length === 0 && (
                    <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', marginTop: '2rem' }}>
                        {activeTab === 'active' ? 'Yangi buyurtmalar yo\'q' : 'Tarix bo\'sh'}
                    </p>
                )}

                {displayedOrders.map(order => (
                    <div key={order.id} style={{
                        background: order.printed ? '#064e3b' : 'var(--bg-card)',
                        border: order.printed ? '1px solid var(--success)' : '1px solid var(--border-color)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius)',
                        display: 'flex', flexDirection: 'column', gap: '1rem',
                        position: 'relative',
                        opacity: order.printed ? 0.8 : 1
                    }}>
                        {order.printed && activeTab === 'history' && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--success)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                ✅ CHIQARILGAN
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>STOL {order.tableId}</span>
                            {activeTab === 'active' && (
                                <button
                                    onClick={() => handleDelete(order)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    title="Buyurtmani o'chirish"
                                >
                                    <FaTrash size={18} />
                                </button>
                            )}
                            <span style={{ color: '#aaa', display: activeTab !== 'active' ? 'block' : 'none' }}>{new Date(order.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div style={{ flex: 1 }}>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    <span>{item.quantity}x {item.name}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePrint(order)}
                            style={{
                                background: order.printed ? '#333' : '#fff',
                                color: order.printed ? '#fff' : '#000',
                                padding: '0.8rem', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                fontWeight: 'bold', fontSize: '1rem',
                                border: order.printed ? '1px solid #555' : 'none'
                            }}
                        >
                            <FaPrint /> {order.printed ? 'QAYTA CHIQARISH' : 'CHEK CHIQARISH'}
                        </button>
                    </div>
                ))}
            </div>

            {/* KITCHEN TICKET PRINT PORTAL */}
            {ticketToPrint && (
                <PrintPortal>
                    <div className="print-ticket">
                        <h3>KAFE EPOS</h3>
                        <p>Oshxona Cheki</p>
                        <hr />
                        <div className="ticket-header">
                            <h2>STOL {ticketToPrint.tableId}</h2>
                            <p>{new Date(ticketToPrint.timestamp).toLocaleString()}</p>
                        </div>
                        <hr />
                        <div className="ticket-body">
                            {ticketToPrint.items.map((item, i) => (
                                <div key={i} className="ticket-item">
                                    <div className="ticket-row-1">
                                        <span>{item.quantity} x {item.name}</span>
                                    </div>
                                    {/* Kitchen ticket also shows price? Usually no, but sticking to structure in case user wants. 
                                        Wait, original code didn't show price in Kitchen Ticket, only Name and Qty. 
                                        Let's KEEP it straightforward for Kitchen: just Name and Qty line is fine, or maybe Name on one line, Qty on line?
                                        Actually, User said "1ta no'l yoq", implying PRICE cutoff. Kitchen tickets usually don't have prices. 
                                        The user complaint was about "hisob chekida" (receipt).
                                        I will update Kitchen Ticket to match the robust 2-line style anyway for consistency if names are long.
                                     */}
                                </div>
                            ))}
                        </div>
                        <hr />
                        <p className="ticket-footer">--- ---------------- ---</p>
                    </div>
                    <style>{`
                            .print-ticket {
                                width: 44mm;
                                margin: 0 auto;
                                background: white;
                                color: #000000 !important;
                                font-family: 'Courier New', monospace;
                                padding-bottom: 5mm;
                                font-size: 16px;
                                font-weight: 700;
                            }
                            .print-ticket h3 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; text-align: center; }
                            .print-ticket p { margin: 0; font-size: 16px; text-align: center; font-weight: 800; }
                            .print-ticket hr { border-top: 2px dashed #000; margin: 5px 0; }
                            .ticket-header h2 { font-size: 18px; margin: 0; font-weight: 900; }
                            .ticket-header p { font-size: 14px; margin: 0; font-weight: 700; }
                            .ticket-body { font-size: 17px; font-weight: 900; }
                            .ticket-item { margin-bottom: 8px; display: flex; flexDirection: column; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
                            .ticket-row-1 { display: flex; justify-content: flex-start; text-align: left; overflow-wrap: break-word; }
                            .ticket-row-2 { text-align: center; width: 100%; margin-top: 2px; } /* Centered Price/Qty */
                            .ticket-footer { font-size: 14px; margin-top: 5px; text-align: center; font-weight: 700; }
                        `}</style>
                </PrintPortal>
            )}
        </div>
    );
};

// --- HELPERS ---
const getTableTotal = (table) => {
    return table.orders.reduce((sum, order) => sum + order.total, 0);
};

// --- PAYMENT MODAL COMPONENT ---
const PaymentModalContent = ({ selectedTable, onClose, onCheckout, settings }) => {
    const [paymentMethod, setPaymentMethod] = useState('Naqd');
    const [splitValues, setSplitValues] = useState({ cash: 0, card: 0, click: 0 });
    const [serviceOff, setServiceOff] = useState(false);
    const [discount, setDiscount] = useState(0);
    // Calculate initial totals
    const initialItemsTotal = selectedTable.orders.reduce((sum, o) => sum + (o.itemsTotal || o.total), 0); // itemsTotal might be missing on old orders
    const initialService = selectedTable.orders.reduce((sum, o) => sum + (o.serviceAmount || 0), 0);
    const initialTotal = getTableTotal(selectedTable);

    // If serviceOff is toggled, we need to recalc
    // Actually, let's derive values from state
    const servicePercentage = settings.servicePercentage || 0;

    // We can't easily recalc service amount from itemsTotal if we don't have it for all orders.
    // But updated orders should have it.
    // Let's assume current stored serviceAmount is correct for the "ON" state.
    const currentServiceAmount = serviceOff ? 0 : initialService;

    // Base total (items only)
    // If orders don't have itemsTotal, we assume total - serviceAmount?
    // Let's rely on getTableTotal representing (Items + Service).
    // So Items = Total - Service.
    const itemsTotal = initialTotal - initialService;

    const grossTotal = itemsTotal + currentServiceAmount;
    const finalTotal = grossTotal - discount;

    const handleFinalize = () => {
        let finalMethod = paymentMethod;

        if (paymentMethod === 'Aralash') {
            const { cash, card, click } = splitValues;
            const sum = Number(cash) + Number(card) + Number(click);
            if (sum !== finalTotal) {
                alert(`Summa to'g'ri kelmadi! Jami: ${finalTotal.toLocaleString()}, Kiritildi: ${sum.toLocaleString()}`);
                return;
            }
            finalMethod = `Aralash (Naqd: ${cash.toLocaleString()}, Karta: ${card.toLocaleString()}, Click: ${click.toLocaleString()})`;
        }

        onCheckout(finalMethod, { discount, serviceOff });
    };

    return (
        <div style={{ background: '#252525', padding: '2rem', borderRadius: '16px', width: '450px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2>To'lov: {selectedTable.name}</h2>
                <button onClick={onClose} style={{ background: 'transparent', color: '#fff', fontSize: '1.5rem', border: 'none', cursor: 'pointer' }}><FaTimes /></button>
            </div>

            {/* Totals Breakdown */}
            <div style={{ background: '#333', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                    <span>Taomlar:</span>
                    <span>{itemsTotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                            type="checkbox"
                            checked={!serviceOff}
                            onChange={() => setServiceOff(!serviceOff)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                        />
                        <span>Xizmat ({serviceOff ? '0' : servicePercentage}%):</span>
                    </label>
                    <span style={{ color: serviceOff ? '#666' : '#fff' }}>{currentServiceAmount.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span>Chegirma (Skidka):</span>
                    <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        style={{ width: '100px', padding: '0.3rem', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', textAlign: 'right' }}
                    />
                </div>

                <div style={{ borderTop: '1px solid #555', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                    <span>JAMI:</span>
                    <span>{finalTotal.toLocaleString()} so'm</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                {['Naqd', 'Karta', 'Click', 'Aralash'].map(method => (
                    <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                            padding: '1rem', borderRadius: '8px', fontWeight: 'bold',
                            background: paymentMethod === method ? 'var(--accent-color)' : '#333',
                            color: paymentMethod === method ? '#000' : '#fff',
                            border: paymentMethod === method ? 'none' : '1px solid #444',
                            cursor: 'pointer'
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
                    <div style={{ marginTop: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: (splitValues.cash + splitValues.card + splitValues.click) === finalTotal ? 'var(--success)' : 'var(--danger)' }}>
                        Kiritildi: {(splitValues.cash + splitValues.card + splitValues.click).toLocaleString()} so'm
                    </div>
                </div>
            )}

            <button
                onClick={handleFinalize}
                style={{ width: '100%', padding: '1rem', background: 'var(--success)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', border: 'none', cursor: 'pointer' }}
            >
                YOPISH VA CHOP ETISH
            </button>
        </div>
    );
};

const AdminApp = () => {
    const { tables, checkoutTable, updateOrder, completedOrders, archives, menu, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, deleteCategory, clearHistory, closeDay, addTable, deleteTable, reservations, addReservation, updateReservation, deleteReservation, activateReservation, settings, updateSettings } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cashier'); // cashier, menu, categories, history, settings
    const [selectedTable, setSelectedTable] = useState(null);
    const [printingBill, setPrintingBill] = useState(false);

    // Auto-print effect
    useEffect(() => {
        if (printingBill) {
            const timer = setTimeout(() => {
                window.print();
                setPrintingBill(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [printingBill]);

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingCheckout, setPendingCheckout] = useState(null);

    // Error Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginRole, setLoginRole] = useState('cashier'); // 'cashier' or 'admin' 
    const [userRole, setUserRole] = useState(''); // The authenticated role

    // SYNC SELECTED TABLE w/ REALTIME DATA
    useEffect(() => {
        if (selectedTable) {
            const updatedTable = tables.find(t => t.id === selectedTable.id);
            if (updatedTable) {
                // Only update if data actually changed to avoid loop (though react handles obj ref diff)
                // Actually we want to update to get new totals/orders
                setSelectedTable(updatedTable);
            }
        }
    }, [tables, selectedTable?.id]); // Depend on tables and current ID

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
            setErrorMsg("Parol noto'g'ri!");
            setShowErrorModal(true);
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

                {/* CUSTOM ERROR MODAL LOGIN */}
                {showErrorModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2200
                    }}>
                        <div style={{
                            background: '#1e1e1e', padding: '2rem', borderRadius: '12px',
                            width: '350px', textAlign: 'center', border: '1px solid #ff4444',
                            boxShadow: '0 10px 25px rgba(255, 68, 68, 0.2)'
                        }}>
                            <div style={{ color: '#ff4444', marginBottom: '1rem' }}>
                                <FaTimes size={40} />
                            </div>
                            <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>Xatolik</h2>
                            <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.2rem' }}>
                                {errorMsg}
                            </p>
                            <button
                                onClick={() => setShowErrorModal(false)}
                                style={{
                                    padding: '0.8rem 2rem',
                                    background: '#333', color: '#fff',
                                    border: '1px solid #555', borderRadius: '8px',
                                    cursor: 'pointer', fontSize: '1rem', width: '100%'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }



    // --- SUB-COMPONENTS ---



    // --- RESERVATION MODAL ---
    const ReservationModal = ({ onClose, initialData }) => {
        const [formData, setFormData] = useState(initialData ? {
            customer: initialData.customer,
            phone: initialData.phone,
            date: initialData.date,
            guests: initialData.guests,
            deposit: initialData.deposit || 0
        } : { customer: '', phone: '', date: '', guests: 10, deposit: 0 });

        const [selectedTables, setSelectedTables] = useState(initialData ? initialData.tableIds : []);
        const [preOrderItems, setPreOrderItems] = useState((initialData && initialData.items) ? initialData.items : []);
        const [menuSearch, setMenuSearch] = useState('');

        const toggleTable = (id) => {
            setSelectedTables(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
        };

        const addToPreOrder = (item) => {
            setPreOrderItems(prev => {
                const existing = prev.find(i => i.id === item.id);
                if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                return [...prev, { ...item, quantity: 1 }];
            });
        };

        const removeFromPreOrder = (id) => {
            setPreOrderItems(prev => prev.filter(i => i.id !== id));
        };

        const handleSubmit = () => {
            if (!formData.customer) return alert("Mijoz ismini kiriting!");
            if (!formData.phone) return alert("Telefon raqamni kiriting!");
            if (!formData.date) return alert("Sana va vaqtni tanlang!");
            if (selectedTables.length === 0) return alert("Kamida bitta stol tanlang!");

            const dataToSave = { ...formData, tableIds: selectedTables, items: preOrderItems };
            if (initialData) {
                updateReservation({ ...dataToSave, id: initialData.id });
            } else {
                addReservation(dataToSave);
            }
            onClose();
        };

        const filteredMenu = menu.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase()));
        const preOrderTotal = preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                <div style={{ width: '900px', maxWidth: '95%', maxHeight: '90vh', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #444', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>

                    {/* Header */}
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#222' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{initialData ? 'Bronni Tahrirlash' : 'Yangi Banket Broni'}</h2>
                            <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '0.9rem' }}>Mijoz ma'lumotlari va oldindan buyurtma</p>
                        </div>
                        <button type="button" onClick={onClose} style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '0.8rem', borderRadius: '50%', cursor: 'pointer' }}><FaTimes size={18} /></button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem', scrollbarWidth: 'thin', scrollbarColor: '#333 #000' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                            {/* 1. Customer Info */}
                            {/* Row 1: Name & Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>MIJOZ ISMI</label>
                                    <input required placeholder="Masalan: Ali Valiyev" value={formData.customer} onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                        style={{ padding: '0.8rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>TELEFON RAQAM</label>
                                    <input required placeholder="+998 90 123 45 67" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ padding: '0.8rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>

                            {/* Row 2: Date, Time, Guests, Deposit */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>

                                {/* Date & Time */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>SANA VA VAQT</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input required type="date"
                                            value={formData.date ? formData.date.split('T')[0] : ''}
                                            onChange={e => setFormData({ ...formData, date: `${e.target.value}T${formData.date ? formData.date.split('T')[1] || '12:00' : '12:00'}` })}
                                            style={{ flex: 1, padding: '0.6rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', outline: 'none', colorScheme: 'dark', fontSize: '0.95rem' }} />
                                        <input required type="time"
                                            value={formData.date ? formData.date.split('T')[1] : '18:00'}
                                            onChange={e => setFormData({ ...formData, date: `${formData.date ? formData.date.split('T')[0] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}T${e.target.value}` })}
                                            style={{ width: '90px', padding: '0.6rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', outline: 'none', colorScheme: 'dark', fontSize: '0.95rem' }} />
                                    </div>
                                    {/* Short Buttons: Bugun/Ertaga */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" onClick={() => {
                                            const d = new Date();
                                            const dateStr = d.toISOString().split('T')[0];
                                            setFormData(prev => ({ ...prev, date: `${dateStr}T${prev.date ? prev.date.split('T')[1] || '18:00' : '18:00'}` }));
                                        }} style={{ flex: 1, padding: '0.3rem', background: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Bugun</button>
                                        <button type="button" onClick={() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + 1);
                                            const dateStr = d.toISOString().split('T')[0];
                                            setFormData(prev => ({ ...prev, date: `${dateStr}T${prev.date ? prev.date.split('T')[1] || '18:00' : '18:00'}` }));
                                        }} style={{ flex: 1, padding: '0.3rem', background: '#222', color: '#aaa', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Ertaga</button>
                                    </div>
                                </div>

                                {/* Guests */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>MEHMONLAR</label>
                                    <input required type="number" min="1" placeholder="10" value={formData.guests} onChange={e => setFormData({ ...formData, guests: Number(e.target.value) })}
                                        style={{ padding: '0.6rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
                                </div>

                                {/* Deposit */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>ZALOG</label>
                                    <input
                                        type="text"
                                        placeholder="0"
                                        value={formData.deposit > 0 ? formData.deposit.toLocaleString('ru-RU') : ''}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\s/g, '');
                                            if (!isNaN(val)) {
                                                setFormData({ ...formData, deposit: Number(val) });
                                            }
                                        }}
                                        style={{ padding: '0.6rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* 2. Table Selection */}
                            <div>
                                <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '1rem', letterSpacing: '0.5px' }}>STOLLARNI TANLASH</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {tables.map(t => (
                                        <button type="button" key={t.id} onClick={() => toggleTable(t.id)}
                                            style={{
                                                padding: '1rem 1.5rem', borderRadius: '8px',
                                                border: selectedTables.includes(t.id) ? '1px solid var(--accent-color)' : '1px solid #222',
                                                background: selectedTables.includes(t.id) ? 'var(--accent-color)' : '#111',
                                                color: selectedTables.includes(t.id) ? '#000' : '#888',
                                                fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
                                            }}>
                                            <span>{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Pre-order */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '400px' }}>
                                {/* Menu List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>TAOMLAR RO'YXATI</label>
                                    <div style={{ position: 'relative' }}>
                                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                        <input placeholder="Qidirish..." value={menuSearch} onChange={e => setMenuSearch(e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#2d2d2d', border: '1px solid #444', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', border: '1px solid #222', borderRadius: '8px', background: '#050505' }}>
                                        {filteredMenu.map(item => {
                                            const qty = preOrderItems.find(i => i.id === item.id)?.quantity || 0;
                                            return (
                                                <div key={item.id} onClick={() => addToPreOrder(item)}
                                                    style={{ padding: '0.8rem 1rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#111'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <span style={{ fontWeight: '500', color: qty > 0 ? 'var(--accent-color)' : '#fff' }}>{item.name}</span>

                                                    {qty > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (qty === 1) removeFromPreOrder(item.id);
                                                                    else setPreOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i));
                                                                }}
                                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                            >-</button>
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const val = prompt("Miqdorni kiriting:", qty);
                                                                    if (val !== null) {
                                                                        const num = parseInt(val);
                                                                        if (!isNaN(num) && num > 0) {
                                                                            setPreOrderItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: num } : i));
                                                                        }
                                                                    }
                                                                }}
                                                                style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center', cursor: 'pointer', borderBottom: '1px dashed #666' }}
                                                                title="O'zgartirish uchun bosing"
                                                            >{qty}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); addToPreOrder(item); }}
                                                                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #444', background: 'var(--accent-color)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                            >+</button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{item.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Pre-order Cart */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>TANLANGAN TAOMLAR</label>
                                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', border: '1px solid #222', borderRadius: '8px', background: '#111', padding: '1rem' }}>
                                        {preOrderItems.length === 0 ? (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '0.9rem' }}>Hech narsa tanlanmadi</div>
                                        ) : (
                                            preOrderItems.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #222' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.quantity} x {item.price.toLocaleString()}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{(item.price * item.quantity).toLocaleString()}</span>
                                                        <button type="button" onClick={() => removeFromPreOrder(item.id)} style={{ color: '#ef4444', background: 'transparent', border: '1px solid #ef4444', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}><FaTrash size={10} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#888' }}>Jami summa:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-color)' }}>{preOrderTotal.toLocaleString()} so'm</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #333', background: '#222', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '1rem 2rem', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>BEKOR QILISH</button>
                        <button type="button" onClick={handleSubmit}
                            style={{ padding: '1rem 3rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                            TASDIQLASH
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 1. CASHIER VIEW
    const CashierView = () => {

        // Calculate Total for Table
        const getTableTotal = (table) => {
            // "total" property in table is ALREADY the sum of order.total (which includes service charge).
            // But let's be sure. In server, table.total += newOrder.total.
            // So table.total is correct.
            // Only for receipt breakdown we might want raw items total.
            // For now, this function is mostly used for "Jami" display.
            // But wait, the previous code was: table.orders.reduce((sum, order) => sum + order.total, 0);
            return table.orders.reduce((sum, order) => sum + order.total, 0);
        };

        const [showPaymentModal, setShowPaymentModal] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState('Naqd');
        const [splitValues, setSplitValues] = useState({ cash: 0, card: 0, click: 0 });
        const [showReservations, setShowReservations] = useState(false);
        const [showAddResModal, setShowAddResModal] = useState(false);
        const [editingReservation, setEditingReservation] = useState(null);
        const [reservationToPrint, setReservationToPrint] = useState(null);

        const handlePrintReservation = (res) => {
            setReservationToPrint(res);
            setTimeout(() => window.print(), 100);
        };

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#888' }}>Stollar Holati</h2>
                        <button onClick={() => setShowReservations(true)} style={{ background: '#7c3aed', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold' }}>
                            📅 BRONLAR ({reservations.length})
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', alignContent: 'start', flex: 1, overflowY: 'auto' }}>
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
                                    textAlign: 'center',
                                    position: 'relative'
                                }}
                            >
                                {table.status !== 'free' && table.total === 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Stolni majburiy bo'shatishni xohlaysizmi?")) {
                                                checkoutTable(table.id, "MAJBURIY");
                                            }
                                        }}
                                        style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                                        title="Majburiy bo'shatish"
                                    >x</button>
                                )}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#aaa', marginBottom: '0.2rem' }}>
                                                <span>Buyurtma #{idx + 1} - {new Date(order.timestamp).toLocaleTimeString()}</span>
                                                <span style={{ color: 'var(--accent-color)' }}>Ofitsiant: {order.waiterName || "Noma'lum"}</span>
                                            </div>
                                            {order.items.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newItems = [...order.items];
                                                                if (newItems[i].quantity > 1) {
                                                                    newItems[i].quantity -= 1;
                                                                    updateOrder(order.id, newItems);
                                                                } else {
                                                                    if (window.confirm(`${item.name} ni hisobdan o'chirmoqchimisiz?`)) {
                                                                        newItems.splice(i, 1);
                                                                        updateOrder(order.id, newItems);
                                                                    }
                                                                }
                                                            }}
                                                            style={{ background: '#444', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >-</button>
                                                        <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newItems = [...order.items];
                                                                newItems[i].quantity += 1;
                                                                updateOrder(order.id, newItems);
                                                            }}
                                                            style={{ background: '#444', color: '#fff', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >+</button>
                                                        <span style={{ marginLeft: '5px' }}>x {item.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span>{(item.price * item.quantity).toLocaleString()}</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`${item.name} ni hisobdan o'chirmoqchimisiz?`)) {
                                                                    const newItems = [...order.items];
                                                                    newItems.splice(i, 1);
                                                                    updateOrder(order.id, newItems);
                                                                }
                                                            }}
                                                            style={{
                                                                background: '#333', border: 'none', color: '#ef4444',
                                                                cursor: 'pointer', padding: '4px', borderRadius: '4px',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                            title="O'chirish"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
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
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        disabled={selectedTable.status === 'free'}
                                        onClick={() => setPrintingBill(true)}
                                        style={{
                                            flex: 1, padding: '1rem',
                                            background: '#333', border: '1px solid #555',
                                            color: '#fff', borderRadius: '8px', fontSize: '1.2rem',
                                            cursor: selectedTable.status === 'free' ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <FaPrint /> CHEK
                                    </button>
                                    <button
                                        disabled={selectedTable.status === 'free'}
                                        onClick={handleCheckoutClick}
                                        style={{
                                            flex: 2, padding: '1rem',
                                            background: selectedTable.status === 'free' ? '#333' : 'var(--success)',
                                            color: '#fff', borderRadius: '8px', fontSize: '1.2rem',
                                            cursor: selectedTable.status === 'free' ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {selectedTable.status === 'free' ? 'Stol Bo\'sh' : 'TO\'LOV QILISH'}
                                    </button>
                                </div>
                            </div>

                            {/* PRE-CHECKOUT BILL PRINT */}
                            {printingBill && (
                                <PrintPortal>
                                    <div className="print-receipt">
                                        <h3>KAFE EPOS</h3>
                                        <p>Hisob-kitob (To'lanmagan)</p>
                                        <hr />
                                        <div className="receipt-header">
                                            <h2>{selectedTable.name}</h2>
                                            <p>{new Date().toLocaleString()}</p>
                                        </div>
                                        <hr />
                                        <div className="receipt-items">
                                            {selectedTable.orders.flatMap(o => o.items).map((item, i) => (
                                                <div key={i} className="receipt-item">
                                                    <div className="receipt-row-1">
                                                        {item.quantity} x {item.name}
                                                    </div>
                                                    <div className="receipt-row-2">
                                                        {(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <hr />
                                        <div className="receipt-total">
                                            <span>JAMI (Taomlar):</span>
                                            <span>{getTableTotal(selectedTable).toLocaleString()} so'm</span>
                                        </div>
                                        {/* Show default service charge if enabled in settings? 
                                            We don't know if they will toggle it off, but standard bill shows it.
                                            Let's show it based on settings.
                                        */}
                                        {settings.servicePercentage > 0 && (
                                            <div className="receipt-total" style={{ fontSize: '16px', fontWeight: 'normal' }}>
                                                <span>Xizmat ({settings.servicePercentage}%):</span>
                                                <span>{(getTableTotal(selectedTable) * settings.servicePercentage / 100).toLocaleString()} so'm</span>
                                            </div>
                                        )}
                                        <div className="receipt-total" style={{ fontSize: '20px', borderTop: '1px solid #000', paddingTop: '5px', marginTop: '5px' }}>
                                            <span>JAMI:</span>
                                            <span>{(getTableTotal(selectedTable) * (1 + (settings.servicePercentage || 0) / 100)).toLocaleString()} so'm</span>
                                        </div>
                                        <hr />
                                        <style>{`
                                            .print-receipt {
                                                width: 44mm;
                                                margin: 0 auto;
                                                background: white;
                                                color: #000000 !important;
                                                font-family: 'Courier New', monospace;
                                                padding-bottom: 5mm;
                                                text-align: center;
                                                font-size: 16px;
                                                font-weight: 700;
                                            }
                                            .print-receipt h3 { margin: 0; font-size: 20px; font-weight: 900; }
                                            .print-receipt p { margin: 2px 0; font-size: 16px; font-weight: 800; }
                                            .receipt-item { display: flex; flex-direction: column; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
                                            .receipt-row-1 { text-align: left; width: 100%; overflow-wrap: break-word; }
                                            .receipt-row-2 { text-align: center; width: 100%; margin-top: 2px; font-size: 18px; font-weight: 900; }
                                            .receipt-total { display: flex; justifyContent: space-between; font-weight: 900; font-size: 18px; margin: 5px 0; }
                                            hr { border-top: 2px dashed #000; margin: 5px 0; }
                                        `}</style>
                                    </div>
                                </PrintPortal>
                            )}

                            {showPaymentModal && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.8)', zIndex: 100,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <PaymentModalContent
                                        selectedTable={selectedTable}
                                        onClose={() => setShowPaymentModal(false)}
                                        onCheckout={(method, extras) => {
                                            // 1. Print
                                            window.print();

                                            // 2. Open Custom Confirm Modal
                                            setTimeout(() => {
                                                setPendingCheckout({ method, extras });
                                                setShowConfirmModal(true);
                                                setShowPaymentModal(false);
                                            }, 100);
                                        }}
                                        settings={settings}
                                    />
                                </div>
                            )}

                            {/* CUSTOM CONFIRMATION MODAL */}
                            {showConfirmModal && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 2000
                                }}>
                                    <div style={{
                                        background: '#1e1e1e', padding: '2rem', borderRadius: '12px',
                                        width: '400px', textAlign: 'center', border: '1px solid #444',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                                    }}>
                                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>To'lovni Tasdiqlash</h2>
                                        <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.2rem' }}>
                                            Chek chiqarildi.<br />
                                            To'lov to'liq qabul qilindimi va stol yopilsinmi?
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => {
                                                    setShowConfirmModal(false);
                                                    setPendingCheckout(null); // Cancel
                                                }}
                                                style={{
                                                    flex: 1, padding: '1rem',
                                                    background: '#333', color: '#fff',
                                                    border: '1px solid #555', borderRadius: '8px',
                                                    cursor: 'pointer', fontSize: '1rem'
                                                }}
                                            >
                                                YO'Q (Qaytish)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (pendingCheckout && selectedTable) {
                                                        checkoutTable(selectedTable.id, pendingCheckout.method, pendingCheckout.extras);
                                                        setShowConfirmModal(false);
                                                        setPendingCheckout(null);
                                                        setSelectedTable(null);
                                                    }
                                                }}
                                                style={{
                                                    flex: 1, padding: '1rem',
                                                    background: 'var(--success)', color: '#fff',
                                                    border: 'none', borderRadius: '8px',
                                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'
                                                }}
                                            >
                                                HA, YOPILSIN
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOM ERROR MODAL */}
                            {showErrorModal && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 2200
                                }}>
                                    <div style={{
                                        background: '#1e1e1e', padding: '2rem', borderRadius: '12px',
                                        width: '350px', textAlign: 'center', border: '1px solid #ff4444',
                                        boxShadow: '0 10px 25px rgba(255, 68, 68, 0.2)'
                                    }}>
                                        <div style={{ color: '#ff4444', marginBottom: '1rem' }}>
                                            <FaTimes size={40} />
                                        </div>
                                        <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>Xatolik</h2>
                                        <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.2rem' }}>
                                            {errorMsg}
                                        </p>
                                        <button
                                            onClick={() => setShowErrorModal(false)}
                                            style={{
                                                padding: '0.8rem 2rem',
                                                background: '#333', color: '#fff',
                                                border: '1px solid #555', borderRadius: '8px',
                                                cursor: 'pointer', fontSize: '1rem', width: '100%'
                                            }}
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER RECEIPT PORTAL */}
                            {showPaymentModal && (
                                <PrintPortal>
                                    <div className="print-receipt">
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
                                                    <div className="receipt-row-1">
                                                        {item.quantity} x {item.name}
                                                    </div>
                                                    <div className="receipt-row-2">
                                                        {(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <hr />
                                        <div className="receipt-total">
                                            <span>JAMI (Taomlar):</span>
                                            <span>{getTableTotal(selectedTable).toLocaleString()} so'm</span>
                                        </div>
                                        {((selectedTable.orders.reduce((sum, o) => sum + (o.serviceAmount || 0), 0)) > 0) && (
                                            <div className="receipt-total" style={{ fontSize: '16px', fontWeight: 'normal' }}>
                                                <span>Xizmat ({settings.servicePercentage}%):</span>
                                                <span>{selectedTable.orders.reduce((sum, o) => sum + (o.serviceAmount || 0), 0).toLocaleString()} so'm</span>
                                            </div>
                                        )}
                                        <div className="receipt-total" style={{ fontSize: '20px', borderTop: '1px solid #000', paddingTop: '5px', marginTop: '5px' }}>
                                            <span>JAMI TO'LOV:</span>
                                            <span>{selectedTable.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} so'm</span>
                                        </div>
                                        <hr />
                                        <div style={{ textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>
                                            To'lov: {paymentMethod === 'Aralash'
                                                ? `Aralash`
                                                : paymentMethod}
                                        </div>
                                        <p style={{ textAlign: 'center', marginTop: '10px' }}>Xizmatlaringiz uchun rahmat!</p>
                                    </div>
                                    <style>{`
                                        .print-receipt {
                                            width: 44mm;
                                            margin: 0 auto;
                                            background: white;
                                            color: #000000 !important;
                                            font-family: 'Courier New', monospace;
                                            padding-bottom: 5mm;
                                            text-align: center;
                                            font-size: 16px;
                                            font-weight: 700;
                                        }
                                        .print-receipt h3 { margin: 0; font-size: 20px; font-weight: 900; }
                                        .print-receipt p { margin: 2px 0; font-size: 16px; font-weight: 800; }
                                        .receipt-item { display: flex; flex-direction: column; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
                                        .receipt-row-1 { text-align: left; width: 100%; overflow-wrap: break-word; }
                                        .receipt-row-2 { text-align: center; width: 100%; margin-top: 2px; font-size: 18px; font-weight: 900; } /* Centered Price */
                                        .receipt-total { display: flex; justifyContent: space-between; font-weight: 900; font-size: 18px; margin: 5px 0; }
                                        hr { border-top: 2px dashed #000; margin: 5px 0; }
                                    `}</style>
                                </PrintPortal>
                            )
                            }
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            Stol tanlang
                        </div>
                    )}
                </div >

                {/* RESERVATIONS LIST MODAL */}
                {
                    showReservations && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ width: '800px', maxWidth: '95%', height: '80%', background: '#1e1e1e', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                    <h2>Bronlar Ro'yxati</h2>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => { setEditingReservation(null); setShowAddResModal(true); }} style={{ background: 'var(--success)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px' }}>+ Yangi Bron</button>
                                        <button onClick={() => setShowReservations(false)} style={{ background: '#333', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px' }}>Yopish</button>
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '1rem' }}>
                                    {reservations.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>Bronlar yo'q</p> :
                                        reservations.map(res => (
                                            <div key={res.id} style={{ background: '#252525', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #7c3aed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h3 style={{ margin: 0 }}>{res.customer} <span style={{ fontSize: '0.9rem', color: '#aaa' }}>({res.guests} kishi)</span></h3>
                                                    <p style={{ margin: '5px 0', color: 'var(--accent-color)' }}>{new Date(res.date).toLocaleString()}</p>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Stollar: {res.tableIds.map(tid => tables.find(t => t.id === tid)?.name).join(', ')}</p>
                                                    {res.items && res.items.length > 0 && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>+ {res.items.length} ta taom oldindan</p>}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <button onClick={() => activateReservation(res.id)} style={{ padding: '0.8rem 1.5rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>BOSHLASH</button>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => { setEditingReservation(res); setShowAddResModal(true); }} style={{ flex: 1, padding: '0.5rem', background: '#eab308', color: '#000', border: 'none', borderRadius: '6px' }}><FaEdit /></button>
                                                        <button onClick={() => handlePrintReservation(res)} style={{ flex: 1, padding: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px' }}><FaPrint /></button>
                                                        <button onClick={() => deleteReservation(res.id)} style={{ flex: 1, padding: '0.5rem', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '6px' }}>Bekor qilish</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* ADD RESERVATION FORM MODAL */}
                {showAddResModal && <ReservationModal onClose={() => { setShowAddResModal(false); setEditingReservation(null); }} initialData={editingReservation} />}

                {/* RESERVATION RECEIPT PORTAL */}
                {
                    reservationToPrint && (
                        <PrintPortal>
                            <div className="print-res">
                                <h3>KAFE EPOS</h3>
                                <p>Banket Cheki</p>
                                <hr />
                                <div style={{ textAlign: 'left', margin: '10px 0' }}>
                                    <p>Mijoz: {reservationToPrint.customer}</p>
                                    <p>Tel: {reservationToPrint.phone}</p>
                                    <p>Sana: {new Date(reservationToPrint.date).toLocaleString()}</p>
                                    <p>Mehmonlar: {reservationToPrint.guests} kishi</p>
                                    <p>Stollar: {reservationToPrint.tableIds.map(tid => tables.find(t => t.id === tid)?.name).join(', ')}</p>
                                </div>
                                <hr />
                                <div className="res-items">
                                    {reservationToPrint.items && reservationToPrint.items.map((item, i) => (
                                        <div key={i} className="res-item">
                                            <div className="res-row-1">
                                                {item.quantity} x {item.name}
                                            </div>
                                            <div className="res-row-2">
                                                {(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {reservationToPrint.items && reservationToPrint.items.length > 0 && <hr />}
                                <div className="res-total">
                                    <span>JAMI BUYURTMA:</span>
                                    <span>{reservationToPrint.items ? reservationToPrint.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString() : 0} so'm</span>
                                </div>
                                <div className="res-total">
                                    <span>ZALOG:</span>
                                    <span>{reservationToPrint.deposit ? reservationToPrint.deposit.toLocaleString() : 0} so'm</span>
                                </div>
                                <hr />
                                <div className="res-total" style={{ fontSize: '20px' }}>
                                    <span>QOLDIQ:</span>
                                    <span>{((reservationToPrint.items ? reservationToPrint.items.reduce((sum, i) => sum + (i.price * i.quantity), 0) : 0) - (reservationToPrint.deposit || 0)).toLocaleString()} so'm</span>
                                </div>
                                <p style={{ textAlign: 'center', marginTop: '10px' }}>Kutingizni kutamiz!</p>
                            </div>
                            <style>{`
                            .print-res {
                                width: 58mm;
                                margin: 0 auto;
                                background: white;
                                color: #000000 !important;
                                font-family: 'Courier New', monospace;
                                padding-bottom: 5mm;
                                text-align: center;
                                font-size: 16px;
                                font-weight: 700;
                            }
                            .print-res h3 { margin: 0; font-size: 20px; font-weight: 900; }
                            .print-res p { margin: 2px 0; font-size: 16px; font-weight: 800; }
                            .res-item { display: flex; flex-direction: column; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
                            .res-row-1 { text-align: left; width: 100%; overflow-wrap: break-word; }
                            .res-row-2 { text-align: center; width: 100%; margin-top: 2px; font-weight: 900; }
                            .res-total { display: flex; justifyContent: space-between; font-weight: 900; font-size: 16px; margin: 5px 0; }
                            hr { border-top: 2px dashed #000; margin: 5px 0; }
                        `}</style>
                        </PrintPortal>
                    )
                }
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

        const [isModalOpen, setIsModalOpen] = useState(false);

        const openAddModal = () => {
            setIsEditing(false);
            setEditId(null);
            setFormData({ name: '', price: '', category: defaultCat, image: '' });
            setIsModalOpen(true);
        };

        const openEditModal = (item) => {
            setIsEditing(true);
            setEditId(item.id);
            setFormData({ name: item.name, price: item.price, category: item.category, image: item.image || '' });
            setIsModalOpen(true);
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2>Menyu Boshqaruvi</h2>
                        <span style={{ fontSize: '0.9rem', color: '#888' }}>Bugun mavjud taomlarni o'chirib/yoqishingiz mumkin</span>
                    </div>
                    <button
                        onClick={openAddModal}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'var(--success)', color: '#fff', padding: '0.8rem 1.5rem',
                            borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                        }}
                    >
                        <FaPlus /> Yangi Taom
                    </button>
                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            background: '#202020', width: '500px', maxWidth: '90%',
                            borderRadius: '16px', padding: '2rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                            border: '1px solid #333',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>
                                    {isEditing ? 'Taomni Tahrirlash' : 'Yangi Taom Qo\'shish'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: '#aaa', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={(e) => { handleSubmit(e); setIsModalOpen(false); }}>
                                <div style={{ display: 'grid', gap: '1rem' }}>

                                    {/* Image Preview & Upload */}
                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: '#333', border: '2px dashed #555' }}>
                                            {formData.image ? (
                                                <img
                                                    src={formData.image.startsWith('http') || formData.image.startsWith('/') ? formData.image : `http://localhost:3000${formData.image}`}
                                                    alt="Preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column' }}>
                                                    <FaImage size={30} />
                                                    <span style={{ fontSize: '0.7rem', marginTop: '5px' }}>Rasm yo'q</span>
                                                </div>
                                            )}
                                            <label style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.8rem',
                                                textAlign: 'center', padding: '4px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                                            }}>
                                                <FaCamera /> Yuklash
                                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    </div>
                                    {uploading && <div style={{ textAlign: 'center', color: 'orange', fontSize: '0.8rem' }}>Rasm yuklanmoqda...</div>}

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.4rem' }}>Taom nomi</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Masalan: Palov, Choy"
                                            style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.4rem' }}>Narxi (so'm)</label>
                                            <input
                                                required
                                                type="number"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0"
                                                style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.4rem' }}>Kategoriya</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', fontSize: '1rem' }}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        style={{
                                            marginTop: '1rem', width: '100%', padding: '1rem',
                                            background: 'var(--accent-color)', color: '#000',
                                            fontWeight: 'bold', borderRadius: '8px', border: 'none',
                                            cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1,
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {isEditing ? 'SAQLASH' : 'QO\'SHISH'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {menu.map(item => (
                        <div key={item.id} style={{ background: item.available === false ? '#331111' : '#252525', padding: '1rem', borderRadius: '8px', border: item.available === false ? '1px solid #7f1d1d' : '1px solid #333', position: 'relative', opacity: item.available === false ? 0.7 : 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', textDecoration: item.available === false ? 'line-through' : 'none' }}>{item.name}</h4>
                                    <span style={{ fontSize: '0.7rem', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#aaa' }}>{item.category}</span>
                                </div>
                                {/* Use full URL for uploaded images, handle relative for pre-defined */}
                                {item.image && (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', filter: item.available === false ? 'grayscale(100%)' : 'none' }}>
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

                            {/* AVAILABILITY TOGGLE */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={item.available !== false}
                                    onChange={() => updateMenuItem({ ...item, available: item.available === false })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--success)' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: item.available === false ? '#ef4444' : 'var(--success)', fontWeight: 'bold' }}>
                                    {item.available === false ? 'Tugagan (Stop)' : 'Mavjud'}
                                </span>
                            </label>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => openEditModal(item)}
                                    style={{ flex: 1, background: '#3b82f6', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}
                                >
                                    <FaEdit /> Tahrirlash
                                </button>
                                <button
                                    onClick={() => deleteMenuItem(item.id)}
                                    style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', border: 'none' }}
                                >
                                    <FaTrash /> O'chirish
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

    // 3.5 PLACES VIEW (Tables)
    const PlacesView = () => {
        const [newTable, setNewTable] = useState('');

        const handleAdd = (e) => {
            e.preventDefault();
            if (newTable.trim()) {
                addTable(newTable.trim());
                setNewTable('');
            }
        };

        return (
            <div>
                <h2>Joylar (Stollar)</h2>
                <div style={{ maxWidth: '600px', margin: '2rem 0' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <input
                            value={newTable}
                            onChange={e => setNewTable(e.target.value)}
                            placeholder="Yangi stol nomi (masalan: Stol 10)"
                            style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #333', background: '#252525', color: '#fff' }}
                        />
                        <button type="submit" style={{ padding: '0 2rem', background: 'var(--accent-color)', borderRadius: 'var(--radius)', fontWeight: 'bold' }}>Qo'shish</button>
                    </form>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {tables.map(table => (
                            <div key={table.id} style={{ background: '#252525', padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid #333' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{table.name}</div>
                                <div style={{ fontSize: '0.9rem', color: table.orders?.length > 0 ? '#ef4444' : '#4caf50' }}>
                                    {table.orders?.length > 0 ? 'Band' : 'Bo\'sh'}
                                </div>
                                <button
                                    onClick={() => deleteTable(table.id)}
                                    disabled={table.orders?.length > 0} // Prevent deleting busy tables
                                    style={{
                                        marginTop: 'auto',
                                        background: table.orders?.length > 0 ? '#555' : '#ef4444',
                                        color: '#fff', padding: '0.5rem', borderRadius: '6px',
                                        cursor: table.orders?.length > 0 ? 'not-allowed' : 'pointer',
                                        border: 'none'
                                    }}
                                    title={table.orders?.length > 0 ? "Band stollarni o'chirib bo'lmaydi" : ""}
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

                {/* DAILY REPORT PORTAL */}
                {showDailyReport && (
                    <PrintPortal>
                        <div className="print-report">
                            <h3>KAFE EPOS</h3>
                            <p style={{ fontWeight: 'bold' }}>KUNLIK HISOBOT (Z-REPORT)</p>
                            <p>{new Date().toLocaleDateString()}</p>
                            <hr />
                            <div className="receipt-total">
                                <span>JAMI TUSHUM:</span>
                                <span>{dailyStats.total.toLocaleString()} so'm</span>
                            </div>
                            <hr />
                            <div style={{ textAlign: 'left', margin: '1rem 0', fontSize: '13px' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                                <span>Cheklar soni:</span>
                                <span>{completedOrders.length} ta</span>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '20px' }}>Kassa yopildi.</p>
                        </div>
                        <style>{`
                            .print-report {
                                width: 48mm;
                                margin: 0 auto;
                                background: white;
                                color: #000000 !important;
                                font-family: 'Courier New', monospace;
                                padding-bottom: 5mm;
                                text-align: center;
                                font-size: 16px;
                                font-weight: 700;
                            }
                            .print-report h3 { margin: 0 0 5px 0; font-size: 20px; font-weight: 900; }
                            .print-report p { margin: 0; font-size: 16px; font-weight: 800; }
                            .receipt-total { font-size: 18px; font-weight: 900; display: flex; justifyContent: space-between; margin: 5px 0; }
                            hr { border-top: 2px dashed #000; margin: 5px 0; }
                        `}</style>
                    </PrintPortal>
                )}
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
        const [receiptOrder, setReceiptOrder] = useState(null);

        const toggleExpand = (id) => {
            setExpandedId(expandedId === id ? null : id);
        };

        const handleReprint = (order) => {
            setReceiptOrder(order);
            setTimeout(() => {
                window.print();
            }, 100);
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
                                                        <th style={{ padding: '0.5rem' }}>Amal</th>
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
                                                            <td style={{ padding: '0.5rem' }}>
                                                                <button
                                                                    onClick={() => handleReprint(order)}
                                                                    style={{
                                                                        background: 'transparent', border: 'none',
                                                                        color: 'var(--accent-color)', cursor: 'pointer'
                                                                    }}
                                                                    title="Chekni qayta chiqarish"
                                                                >
                                                                    <FaPrint />
                                                                </button>
                                                            </td>
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


                {/* ARCHIVE RECEIPT PORTAL */}
                {receiptOrder && (
                    <PrintPortal>
                        <div className="print-archive">
                            <h3>KAFE EPOS</h3>
                            <p>Chek nusxasi (Arxiv)</p>
                            <hr />
                            <div className="receipt-header">
                                <h2>Stol {receiptOrder.tableId}</h2>
                                <p>{new Date(receiptOrder.timestamp).toLocaleString()}</p>
                            </div>
                            <hr />
                            <div className="receipt-items">
                                {receiptOrder.items.map((item, i) => (
                                    <div key={i} className="receipt-item">
                                        <div className="receipt-row-1">
                                            {item.quantity} x {item.name}
                                        </div>
                                        <div className="receipt-row-2">
                                            {(item.price * item.quantity).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr />
                            <div className="receipt-total">
                                <span>JAMI:</span>
                                <span>{receiptOrder.total.toLocaleString()} so'm</span>
                            </div>
                            <hr />
                            <div style={{ textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>
                                To'lov: {receiptOrder.paymentMethod}
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '10px' }}>Qayta chop etildi</p>
                        </div>
                        <style>{`
                            .print-archive {
                                width: 44mm;
                                margin: 0 auto;
                                background: white;
                                color: #000000 !important;
                                font-family: 'Courier New', monospace;
                                padding-bottom: 5mm;
                                text-align: center;
                                font-size: 16px;
                                font-weight: 700;
                            }
                            .print-archive h3 { margin: 0; font-size: 20px; font-weight: 900; }
                            .print-archive p { margin: 2px 0; font-size: 16px; font-weight: 800; }
                            .receipt-item { display: flex; flex-direction: column; margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
                            .receipt-row-1 { text-align: left; width: 100%; overflow-wrap: break-word; }
                            .receipt-row-2 { text-align: center; width: 100%; margin-top: 2px; font-size: 18px; font-weight: 900; } /* Centered Price */
                            .receipt-total { display: flex; justifyContent: space-between; font-weight: 900; font-size: 18px; margin: 5px 0; }
                            hr { border-top: 2px dashed #000; margin: 5px 0; }
                        `}</style>
                    </PrintPortal>
                )}
            </div >
        );
    };

    // 7. SETTINGS VIEW
    const SettingsView = () => {
        const [percentage, setPercentage] = useState(settings.servicePercentage || 0);

        const handleSave = () => {
            updateSettings({ servicePercentage: Number(percentage) });
            alert("Sozlamalar saqlandi!");
        };

        return (
            <div>
                <h2>Sozlamalar</h2>
                <div style={{ maxWidth: '400px', margin: '2rem 0', background: '#252525', padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Xizmat Haqi (Usluga) %</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', fontSize: '1.1rem' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            Ushbu foiz barcha <b>yangi</b> buyurtmalarga qo'shiladi.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        style={{ width: '100%', padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                    >
                        SAQLASH
                    </button>
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
                                onClick={() => setActiveTab('places')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'places' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaChair /> Joylar
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
                    {userRole === 'admin' && (
                        <button
                            onClick={() => setActiveTab('settings')}
                            style={{
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                background: activeTab === 'settings' ? '#333' : 'transparent', color: '#fff'
                            }}
                        >
                            <FaEdit /> Sozlamalar
                        </button>
                    )}
                    {/* KITCHEN BUTTON (Cashier Only) */}
                    {userRole === 'cashier' && (
                        <button
                            onClick={() => setActiveTab('kitchen')}
                            style={{
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                background: activeTab === 'kitchen' ? '#333' : 'transparent', color: '#fff'
                            }}
                        >
                            <FaPrint /> Oshxona
                        </button>
                    )}
                    {userRole === 'cashier' && (
                        <button
                            onClick={() => setActiveTab('history')}
                            style={{
                                padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                background: activeTab === 'history' ? '#333' : 'transparent', color: '#fff'
                            }}
                        >
                            <FaHistory /> Tarix
                        </button>
                    )}
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
                {activeTab === 'kitchen' && <KitchenView />}
                {activeTab === 'menu' && <MenuView />}
                {activeTab === 'categories' && <CategoriesView />}
                {activeTab === 'places' && <PlacesView />}
                {activeTab === 'stats' && <StatsView />}
                {activeTab === 'history' && <HistoryView />}
                {activeTab === 'history' && <HistoryView />}
                {activeTab === 'archives' && <ArchivesView />}
                {activeTab === 'settings' && <SettingsView />}
            </div>

        </div>
    );
};

export default AdminApp;
