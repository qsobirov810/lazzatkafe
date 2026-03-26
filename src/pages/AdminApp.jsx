import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { FaUsers, FaHistory, FaCheck, FaChartLine, FaPlus, FaTrash, FaEdit, FaPrint, FaUtensils, FaChair, FaSignOutAlt, FaTimes, FaCamera, FaImage, FaSearch, FaWallet, FaQrcode, FaCashRegister, FaEnvelope, FaLock } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
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
    const { tables, activeOrders, markOrderPrinted, clearKitchenHistory, cancelOrder, settings } = useData();
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
        const identifier = order.isSaboy ? `Saboy buyurtmasi: ${order.customerName}` : (tables?.find(t => String(t.id) === String(order.tableId))?.name || `Stol ${order.tableId}`);
        if (window.confirm(`Haqiqatan ham ${identifier} buyurtmasini O'CHIRMOQCHIMISIZ?`)) {
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
                                вњ… CHIQARILGAN
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: order.isSaboy ? 'var(--accent-color)' : '#fff' }}>
                                    {order.isSaboy ? `SABOY: ${order.customerName}` : (tables?.find(t => String(t.id) === String(order.tableId))?.name || `STOL ${order.tableId}`)}
                                </span>
                                {order.isSaboy && order.phone && <span style={{ fontSize: '0.9rem', color: '#888' }}>{order.phone}</span>}
                            </div>
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

                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '-0.5rem' }}>
                            {order.isSaboy ? `Mijoz: ${order.customerName}` : `Ofitsiant: ${order.waiterName || 'Noma\'lum'}`}
                        </div>

                        <div style={{ flex: 1 }}>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    <span>{item.quantity}x {item.name}</span>
                                </div>
                            ))}
                            {order.note && (
                                <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#333', borderRadius: '4px', borderLeft: '4px solid var(--accent-color)', fontSize: '1rem', fontStyle: 'italic' }}>
                                    Izoh: {order.note}
                                </div>
                            )}
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
                    <div className="print-receipt">
                        <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                        <p style={{ fontSize: '11px' }}>OSHXONA CHEKI</p>
                        <hr />
                        <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>STOL: <b>{ticketToPrint.isSaboy ? `SABOY (${ticketToPrint.customerName})` : (tables.find(t => String(t.id) === String(ticketToPrint.tableId))?.name || ticketToPrint.tableId)}</b></span>
                                <span>#<b>{ticketToPrint.id.slice(-6).toUpperCase()}</b></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>SANA: {new Date(ticketToPrint.timestamp).toLocaleDateString()}</span>
                                <span>VAQT: {new Date(ticketToPrint.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div>OFITSIANT: <b>{ticketToPrint.waiterName || 'Kassir/Admin'}</b></div>
                        </div>
                        <hr />
                        <div style={{ padding: '0' }}>
                            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px', textAlign: 'left', color: '#000' }}>
                                <thead>
                                    <tr style={{ background: '#f2f2f2' }}>
                                        <th style={{ border: '1px solid #000', width: '15%', padding: '2px', textAlign: 'center' }}>No</th>
                                        <th style={{ border: '1px solid #000', width: '65%', padding: '2px' }}>Nomi</th>
                                        <th style={{ border: '1px solid #000', width: '20%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ticketToPrint.items.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                            <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word', fontSize: '15px' }}>{item.name}</td>
                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {ticketToPrint.note && (
                                <div style={{ border: '2px solid #000', marginTop: '5px', padding: '5px', fontSize: '16px', fontWeight: 'bold', textAlign: 'left' }}>
                                    IZOH: {ticketToPrint.note}
                                </div>
                            )}
                        </div>
                        <hr />
                        <style>{`
                            .print-receipt {
                                width: 80mm !important;
                                margin: 0;
                                background: white;
                                color: #000000 !important;
                                font-family: 'Courier New', monospace;
                                padding: 2mm 3mm;
                                box-sizing: border-box;
                                text-align: center;
                                font-size: 14px;
                            }
                            .print-receipt h3 { margin: 0; font-size: 20px; font-weight: bold; }
                            .receipt-header { margin: 5px 0; }
                            hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
                        `}</style>
                    </div>
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
const PaymentModalContent = ({ selectedTable, onClose, onCheckout, settings, onError, initialServiceOff = false }) => {
    const [paymentMethod, setPaymentMethod] = useState('Naqd');
    const [splitValues, setSplitValues] = useState({ cash: 0, card: 0, click: 0 });
    const [serviceOff, setServiceOff] = useState(initialServiceOff);
    const [discount, setDiscount] = useState(0);

    // Helper for display formatting
    const formatInput = (val) => {
        if (!val && val !== 0) return '';
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const parseInput = (val) => {
        return Number(val.replace(/\s+/g, ''));
    };
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
            const diff = finalTotal - sum;

            if (sum !== finalTotal) {
                const diffMsg = diff > 0
                    ? `Yetmagan summa: ${diff.toLocaleString()} so'm`
                    : `Ortiqcha summa: ${Math.abs(diff).toLocaleString()} so'm`;
                onError(`Summa to'g'ri kelmadi! Jami: ${finalTotal.toLocaleString()} so'm, Kiritildi: ${sum.toLocaleString()} so'm. ${diffMsg}`);
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
                {/* Taomlar summasi olib tashlandi */}

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
                        type="text"
                        inputMode="numeric"
                        value={formatInput(discount)}
                        onChange={(e) => setDiscount(parseInput(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        style={{ width: '120px', padding: '0.3rem', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
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
                                type="text"
                                inputMode="numeric"
                                value={formatInput(splitValues.cash) || ''}
                                onChange={e => setSplitValues({ ...splitValues, cash: parseInput(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                style={{ width: '150px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Plastik (Karta):</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatInput(splitValues.card) || ''}
                                onChange={e => setSplitValues({ ...splitValues, card: parseInput(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                style={{ width: '150px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Click:</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatInput(splitValues.click) || ''}
                                onChange={e => setSplitValues({ ...splitValues, click: parseInput(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                style={{ width: '150px', padding: '0.5rem', borderRadius: '4px', background: '#222', border: '1px solid #555', color: '#fff', textAlign: 'right', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.8rem', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid #444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Kiritildi:</span>
                            <span style={{ color: (splitValues.cash + splitValues.card + splitValues.click) === finalTotal ? 'var(--success)' : '#fff' }}>
                                {(splitValues.cash + splitValues.card + splitValues.click).toLocaleString()} so'm
                            </span>
                        </div>
                        {(splitValues.cash + splitValues.card + splitValues.click) !== finalTotal && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', color: (finalTotal - (splitValues.cash + splitValues.card + splitValues.click)) > 0 ? '#ff4444' : '#ffaa00' }}>
                                <span>{(finalTotal - (splitValues.cash + splitValues.card + splitValues.click)) > 0 ? 'Qoldiq:' : 'Ortiqcha:'}</span>
                                <span style={{ fontWeight: '900' }}>{Math.abs(finalTotal - (splitValues.cash + splitValues.card + splitValues.click)).toLocaleString()} so'm</span>
                            </div>
                        )}
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

const SettingsView = ({ settings, updateSettings, clearAllStatistics, openSuccess }) => {
    const [percentage, setPercentage] = useState(settings.servicePercentage || 0);
    const [kitchenWidth, setKitchenWidth] = useState(settings.kitchenPrinterWidth || 50);
    const [cashierWidth, setCashierWidth] = useState(settings.cashierPrinterWidth || 72);
    const [contact, setContact] = useState({
        phone: settings.phone || '+998 90 123 45 67',
        address: settings.address || 'Toshkent sh., Chilonzor tumani, 1-mavze',
        hours: settings.hours || 'Har kuni: 09:00 - 23:00'
    });

    const handleSave = () => {
        updateSettings({
            servicePercentage: Number(percentage),
            kitchenPrinterWidth: Number(kitchenWidth),
            cashierPrinterWidth: Number(cashierWidth),
            ...contact
        });
        openSuccess("Barcha sozlamalar muvaffaqiyatli saqlandi!");
    };

    const handleSystemReset = () => {
        const pass = window.prompt("TIZIMNI TOZALASH uchun Admin parolini kiriting (8888):");
        if (pass === '8888') {
            if (window.confirm("DIQQAT! Barcha statistika, xarajatlar va arxivlar o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi. Rozimisiz?")) {
                clearAllStatistics();
                openSuccess("Tizim muvaffaqiyatli tozalandi! Barcha statistika 0 ga tenglashtirildi.");
            }
        } else if (pass !== null) {
            alert("Parol noto'g'ri!");
        }
    };

    return (
        <div>
            <h2>Sozlamalar</h2>
            <div style={{ maxWidth: '600px', margin: '2rem 0', display: 'grid', gap: '2rem' }}>

                {/* General Settings */}
                <div style={{ background: '#252525', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Umumiy</h3>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Oshxona Printeri (mm)</label>
                            <input
                                type="number"
                                value={kitchenWidth}
                                onChange={(e) => setKitchenWidth(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Odatda 58mm printer uchun 44-50mm</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Kassa Printeri (mm)</label>
                            <input
                                type="number"
                                value={cashierWidth}
                                onChange={(e) => setCashierWidth(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                            <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Odatda 80mm printer uchun 70-75mm</p>
                        </div>
                    </div>
                </div>

                {/* Contact Settings */}
                <div style={{ background: '#252525', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Sayt Kontakt Ma'lumotlari</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Telefon raqami</label>
                            <input
                                value={contact.phone}
                                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Manzil</label>
                            <input
                                value={contact.address}
                                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Ish vaqti</label>
                            <input
                                value={contact.hours}
                                onChange={(e) => setContact({ ...contact, hours: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    style={{ padding: '1.2rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
                >
                    BARCHA O'ZGARISHLARNI SAQLASH
                </button>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #333' }}>
                    <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>Xavfli Hudud</h4>
                    <button
                        onClick={handleSystemReset}
                        style={{ width: '100%', padding: '1rem', background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        TIZIMNI TOZALASH (STATISTIKA 0)
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                        Ushbu tugma barcha savdo tarixi va statistikalarni o'chiradi.
                    </p>
                </div>
            </div>
        </div>
    );
};

const AdminApp = () => {
    const {
        tables, checkoutTable, updateOrder, completedOrders, archives, menu, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, deleteCategory, clearHistory, closeDay, addTable, deleteTable, reservations, addReservation, updateReservation, deleteReservation, activateReservation, settings, updateSettings, isConnected, messages, deleteMessage, activeOrders, saboyOrders, clearArchives, deleteArchive, clearAllStatistics,
        waiterApplications, approveWaiter, deleteWaiterApplication, user, isAuthenticated, logout
    } = useData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'cashier'); // cashier, menu, categories, history, settings
    const [selectedTable, setSelectedTable] = useState(null);
    const [printingBill, setPrintingBill] = useState(false);

    // If navigating to the cashier route, force the UI into cashier mode even if the user is an admin.
    const isCashierRoute = window.location.pathname.startsWith('/system/cashier');
    const userRole = isCashierRoute ? 'cashier' : (user?.role || 'cashier');
    
    // Validate direct URL access
    useEffect(() => {
        const activeRole = sessionStorage.getItem('activeSessionRole');
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/system/admin') && activeRole !== 'admin') {
            navigate('/system', { replace: true });
        } else if (currentPath.startsWith('/system/cashier') && activeRole !== 'cashier') {
            navigate('/system', { replace: true });
        }
    }, [navigate]);

    const [errorMsg, setErrorMsg] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingCheckout, setPendingCheckout] = useState(null);

    // NEW ORDER NOTIFICATION STATES
    const [prevUnprintedIds, setPrevUnprintedIds] = useState([]);
    const [showNewOrderNotification, setShowNewOrderNotification] = useState(false);
    const isFirstLoad = React.useRef(true);

    useEffect(() => {
        if (!activeOrders) return;
        const currentUnprintedIds = activeOrders.filter(o => !o.printed).map(o => o.id);

        if (isFirstLoad.current) {
            setPrevUnprintedIds(currentUnprintedIds);
            isFirstLoad.current = false;
            return;
        }

        const newIds = currentUnprintedIds.filter(id => !prevUnprintedIds.includes(id));

        if (newIds.length > 0) {
            // New order arrived!
            if (isAuthenticated && activeTab !== 'kitchen' && activeTab !== 'saboy') {
                setShowNewOrderNotification(true);
                // Try to play sound (optional, might be blocked by browser policy without interaction)
                try {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(e => console.log('Audio autoplay prevented'));
                } catch (e) { }
            }
        }

        setPrevUnprintedIds(currentUnprintedIds);
    }, [activeOrders, activeTab, isAuthenticated]);

    // CASHIER VIEW STATES (Moved up to prevent re-mount loss)
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Naqd');
    const [splitValues, setSplitValues] = useState({ cash: 0, card: 0, click: 0 });
    const [showReservations, setShowReservations] = useState(false);
    const [showAddResModal, setShowAddResModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [reservationToPrint, setReservationToPrint] = useState(null);

    // Z-REPORT STATES (Main level for stability)
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [dailyStats, setDailyStats] = useState({ total: 0, cash: 0, card: 0, click: 0 });

    const calculateDailyStats = () => {
        let cash = 0, card = 0, click = 0;
        completedOrders.forEach(order => {
            // Robust parsing: handle potential string totals with spaces or commas
            const totalStr = String(order.total).replace(/[\s,]/g, '');
            const total = Number(totalStr) || 0;
            const method = order.paymentMethod || 'Naqd';

            if (method === 'Naqd') cash += total;
            else if (method === 'Karta') card += total;
            else if (method === 'Click') click += total;
            else if (method.startsWith('Aralash')) {
                // Parse "Aralash (Naqd: 10,000, Karta: 5,000, Click: 0)"
                const clean = method.replace(/[\s,]/g, '');
                const match = clean.match(/Naqd:(\d+).*Karta:(\d+).*Click:(\d+)/i);
                if (match) {
                    cash += Number(match[1]) || 0;
                    card += Number(match[2]) || 0;
                    click += Number(match[3]) || 0;
                } else {
                    cash += total;
                }
            }
        });
        return { total: cash + card + click, cash, card, click };
    };

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

    // Role-based navigation and back button handling
    useEffect(() => {
        const path = window.location.pathname;
        if (isAuthenticated) {
            if (path === '/system/admin') {
                // Remove setUserRole('admin') here since it should be derived from the user token? 
                // Wait, AdminApp actually doesn't have a setUserRole state defined! Let's check below.
                // It's defined as `const userRole = user?.role || 'cashier';` so it's not a state.
                // Actually, the existing code:
                if (activeTab === 'cashier') setActiveTab('menu');
            } else if (path === '/system/cashier') {
                if (!['cashier', 'saboy', 'history', 'kitchen'].includes(activeTab)) setActiveTab('cashier');
            } else if (path === '/system' || path === '/system/') {
                // Redirect user to the proper sub-route based on their role
                if (user?.role === 'admin') {
                    navigate('/system/admin', { replace: true });
                } else if (user?.role === 'waiter') {
                    navigate('/system/waiter', { replace: true });
                } else {
                    navigate('/system/cashier', { replace: true });
                }
            }
        }
    }, [window.location.pathname, isAuthenticated, user, navigate]);

    // Persist Tab
    useEffect(() => {
        localStorage.setItem('adminActiveTab', activeTab);
    }, [activeTab]);

    // Generic Confirm Modal State
    const [showGenericConfirm, setShowGenericConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', msg: '', onConfirm: () => { } });

    const openConfirm = (title, msg, onConfirm) => {
        setConfirmConfig({ title, msg, onConfirm });
        setShowGenericConfirm(true);
    };

    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const openSuccess = (msg) => {
        setSuccessMsg(msg);
        setShowSuccessModal(true);
    };

    // Password Prompt Modal State (For Z-Report)
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [onPasswordSuccess, setOnPasswordSuccess] = useState(null);

    const openPasswordPrompt = (onSuccess) => {
        setPasswordInput('');
        setOnPasswordSuccess(() => onSuccess);
        setShowPasswordModal(true);
    };

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
            return table.orders.reduce((sum, order) => sum + order.total, 0);
        };

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
                            рџ“… BRONLAR ({reservations.length})
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', alignContent: 'start', flex: 1, overflowY: 'auto' }}>
                        {tables?.map(table => (
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
                                            openConfirm(
                                                "Stolni bo'shatish",
                                                "Siz rostdan ham ushbu stolni majburiy bo'shatmoqchimisiz?",
                                                () => checkoutTable(table.id, "MAJBURIY")
                                            );
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
                                            <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px solid #000', paddingBottom: '0.5rem' }}>
                                                <h2>LAZZAT KAFE</h2>
                                                <p style={{ fontSize: '0.9rem' }}>{settings.phone || '+998 90 123 45 67'}</p>
                                            </div>
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
                                                                    openConfirm(
                                                                        "Taomni o'chirish",
                                                                        `${item.name} ni hisobdan o'chirmoqchimisiz?`,
                                                                        () => {
                                                                            newItems.splice(i, 1);
                                                                            updateOrder(order.id, newItems);
                                                                        }
                                                                    );
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
                                                                openConfirm(
                                                                    "Taomni o'chirish",
                                                                    `${item.name} ni hisobdan o'chirmoqchimisiz?`,
                                                                    () => {
                                                                        const newItems = [...order.items];
                                                                        newItems.splice(i, 1);
                                                                        updateOrder(order.id, newItems);
                                                                    }
                                                                );
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
                                        <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                                        <p style={{ fontSize: '11px' }}>{settings.address || "Toshkent sh., Chilonzor tumani"}</p>
                                        <p style={{ fontSize: '11px' }}>Tel: {settings.phone || "+998 90 123 45 67"}</p>
                                        <hr />
                                        <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>STOL: <b>{selectedTable.name}</b></span>
                                                <span>BUYURTMA: #<b>{selectedTable.id}</b></span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>SANA: {new Date().toLocaleDateString()}</span>
                                                <span>VAQT: {new Date().toLocaleTimeString()}</span>
                                            </div>
                                            <div>KASSIR: <b>{user?.username || "Kassir"}</b></div>
                                        </div>
                                        <p style={{ fontWeight: 'bold', margin: '5px 0' }}>HISOB-KITOB (To'lanmagan)</p>
                                        <hr />
                                        <div style={{ padding: '0' }}>
                                            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'left', color: '#000' }}>
                                                <thead>
                                                    <tr style={{ background: '#f2f2f2' }}>
                                                        <th style={{ border: '1px solid #000', width: '10%', padding: '2px', textAlign: 'center' }}>No</th>
                                                        <th style={{ border: '1px solid #000', width: '35%', padding: '2px' }}>Nomi</th>
                                                        <th style={{ border: '1px solid #000', width: '12%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                                        <th style={{ border: '1px solid #000', width: '18%', textAlign: 'right', padding: '2px' }}>Narxi</th>
                                                        <th style={{ border: '1px solid #000', width: '25%', textAlign: 'right', padding: '2px' }}>Summa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedTable.orders.flatMap(o => o.items).map((item, i) => (
                                                        <tr key={i}>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word' }}>{item.name}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <hr />
                                        <div style={{ padding: '0' }}>
                                            {settings.servicePercentage > 0 && (
                                                <div className="receipt-total">
                                                    <span>XIZMAT ({settings.servicePercentage}%):</span>
                                                    <span>{selectedTable.orders.reduce((sum, o) => sum + (o.itemsTotal * settings.servicePercentage / 100), 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="receipt-total" style={{ borderTop: '1px solid #000', paddingTop: '2px', fontSize: '16px' }}>
                                                <span>UMUMIY JAMI:</span>
                                                <span>{selectedTable.orders.reduce((sum, o) => sum + (o.itemsTotal * (1 + (settings.servicePercentage || 0) / 100)), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <style>{`
                                            .print-receipt {
                                                width: 80mm !important;
                                                margin: 0;
                                                background: white;
                                                color: #000000 !important;
                                                font-family: 'Courier New', monospace;
                                                padding: 2mm 3mm;
                                                box-sizing: border-box;
                                                text-align: center;
                                                font-size: 12px;
                                            }
                                            .print-receipt h3 { margin: 0; font-size: 18px; font-weight: bold; }
                                            .print-receipt h2 { margin: 2px 0; font-size: 20px; font-weight: bold; }
                                            .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
                                            hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
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
                                        onError={(msg) => {
                                            setErrorMsg(msg);
                                            setShowErrorModal(true);
                                        }}
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
                                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 2500
                                }}>
                                    <div style={{
                                        background: '#1a1a1a', padding: '2.5rem', borderRadius: '30px',
                                        width: '450px', textAlign: 'center', border: '1px solid rgba(var(--success-rgb), 0.3)',
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                        position: 'relative', overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--success)' }} />

                                        <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '900' }}>To'lovni Tasdiqlash</h2>
                                        <p style={{ color: '#ccc', marginBottom: '2.5rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                                            Chek chiqarildi.<br />
                                            To'lov to'liq qabul qilindimi va stol yopilsinmi?
                                        </p>

                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setShowConfirmModal(false);
                                                    setPendingCheckout(null);
                                                }}
                                                style={{
                                                    flex: 1, padding: '1.2rem',
                                                    background: 'transparent', color: '#888',
                                                    border: '1px solid #333', borderRadius: '15px',
                                                    cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#222'}
                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                            >
                                                QAYTISH
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
                                                    flex: 1, padding: '1.2rem',
                                                    background: 'var(--success)', color: '#fff',
                                                    border: 'none', borderRadius: '15px',
                                                    cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem',
                                                    boxShadow: '0 10px 20px rgba(var(--success-rgb), 0.3)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            >
                                                HA, YOPILSIN
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GENERIC CONFIRM MODAL */}
                            {showGenericConfirm && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    zIndex: 3500
                                }}>
                                    <div style={{
                                        background: '#1a1a1a', padding: '2.5rem', borderRadius: '30px',
                                        width: '400px', textAlign: 'center', border: '1px solid rgba(var(--accent-rgb), 0.3)',
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                                        position: 'relative', overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--accent-color)' }} />

                                        <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '1rem', fontWeight: '900' }}>{confirmConfig.title}</h2>
                                        <p style={{ color: '#ccc', marginBottom: '2.5rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                                            {confirmConfig.msg}
                                        </p>

                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                            <button
                                                onClick={() => setShowGenericConfirm(false)}
                                                style={{
                                                    flex: 1, padding: '1rem',
                                                    background: 'transparent', color: '#888',
                                                    border: '1px solid #333', borderRadius: '15px',
                                                    cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'
                                                }}
                                            >
                                                YO'Q
                                            </button>
                                            <button
                                                onClick={() => {
                                                    confirmConfig.onConfirm();
                                                    setShowGenericConfirm(false);
                                                }}
                                                style={{
                                                    flex: 1, padding: '1rem',
                                                    background: 'var(--accent-color)', color: '#000',
                                                    border: 'none', borderRadius: '15px',
                                                    cursor: 'pointer', fontWeight: '900', fontSize: '1rem',
                                                    boxShadow: '0 10px 20px rgba(var(--accent-rgb), 0.2)'
                                                }}
                                            >
                                                HA, TASDIQLAYMAN
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CUSTOMER RECEIPT PORTAL (Removed Duplicate Modals) */}

                            {/* CUSTOMER RECEIPT PORTAL */}
                            {showPaymentModal && (
                                <PrintPortal>
                                    <div className="print-receipt">
                                        <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                                        <p style={{ fontSize: '11px' }}>{settings.address || "Toshkent sh., Chilonzor tumani"}</p>
                                        <p style={{ fontSize: '11px' }}>Tel: {settings.phone || "+998 90 123 45 67"}</p>
                                        <hr />
                                        <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>STOL: <b>{selectedTable.name}</b></span>
                                                <span>BUYURTMA: #<b>{selectedTable.id}</b></span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>SANA: {new Date().toLocaleDateString()}</span>
                                                <span>VAQT: {new Date().toLocaleTimeString()}</span>
                                            </div>
                                            <div>KASSIR: <b>{user?.username || "Kassir"}</b></div>
                                        </div>
                                        <p style={{ fontWeight: 'bold', margin: '5px 0' }}>MIJOZ CHEKI</p>
                                        <hr />
                                        <div style={{ padding: '0' }}>
                                            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'left', color: '#000' }}>
                                                <thead>
                                                    <tr style={{ background: '#f2f2f2' }}>
                                                        <th style={{ border: '1px solid #000', width: '10%', padding: '2px', textAlign: 'center' }}>No</th>
                                                        <th style={{ border: '1px solid #000', width: '35%', padding: '2px' }}>Nomi</th>
                                                        <th style={{ border: '1px solid #000', width: '12%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                                        <th style={{ border: '1px solid #000', width: '18%', textAlign: 'right', padding: '2px' }}>Narxi</th>
                                                        <th style={{ border: '1px solid #000', width: '25%', textAlign: 'right', padding: '2px' }}>Summa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedTable.orders.flatMap(o => o.items).map((item, i) => (
                                                        <tr key={i}>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word' }}>{item.name}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <hr />
                                        <div style={{ padding: '0' }}>
                                            {settings.servicePercentage > 0 && (
                                                <div className="receipt-total">
                                                    <span>XIZMAT ({settings.servicePercentage}%):</span>
                                                    <span>{selectedTable.orders.reduce((sum, o) => sum + (o.serviceAmount || 0), 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="receipt-total" style={{ borderTop: '1px solid #000', paddingTop: '2px', fontSize: '16px' }}>
                                                <span>UMUMIY JAMI:</span>
                                                <span>{selectedTable.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</span>
                                            </div>
                                            <hr />
                                            <div style={{ textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                                TO'LOV TURI: {paymentMethod}
                                            </div>
                                        </div>
                                        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>Xaridingiz uchun rahmat!</p>
                                        <style>{`
                                            .print-receipt {
                                                width: 80mm !important;
                                                margin: 0;
                                                background: white;
                                                color: #000000 !important;
                                                font-family: 'Courier New', monospace;
                                                padding: 2mm 3mm;
                                                box-sizing: border-box;
                                                text-align: center;
                                                font-size: 12px;
                                            }
                                            .print-receipt h3 { margin: 0; font-size: 18px; font-weight: bold; }
                                            .print-receipt h2 { margin: 2px 0; font-size: 20px; font-weight: bold; }
                                            .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
                                            hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
                                        `}</style>
                                    </div>
                                </PrintPortal>
                            )}
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            Stol tanlang
                        </div>
                    )}
                </div>

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
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa' }}>Stollar: {res.tableIds.map(tid => tables.find(t => String(t.id) === String(tid))?.name).join(', ')}</p>
                                                    {res.items && res.items.length > 0 && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>+ {res.items.length} ta taom oldindan</p>}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => {
                                                            const resTables = tables.filter(t => res.tableIds.includes(t.id));
                                                            const busyTable = resTables.find(t => t.status === 'busy');
                                                            if (busyTable) {
                                                                setErrorMsg(`Bron qilingan joyda (${busyTable.name}) mehmonlar bor, avval ular bilan hisoblashing!`);
                                                                setShowErrorModal(true);
                                                                return;
                                                            }
                                                            activateReservation(res.id);
                                                        }}
                                                        style={{ padding: '0.8rem 1.5rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
                                                    >
                                                        BOSHLASH
                                                    </button>
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
                            <div className="print-receipt">
                                <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                                <p style={{ fontSize: '11px' }}>{settings.address || "Toshkent sh., Chilonzor tumani"}</p>
                                <p style={{ fontSize: '11px' }}>Tel: {settings.phone || "+998 90 123 45 67"}</p>
                                <hr />
                                <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>MIJOZ: <b>{reservationToPrint.customer}</b></span>
                                        <span>STOL: <b>{reservationToPrint.tableIds.map(tid => tables.find(t => String(t.id) === String(tid))?.name).join(', ')}</b></span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>SANA: {new Date(reservationToPrint.date).toLocaleDateString()}</span>
                                        <span>VAQT: {new Date(reservationToPrint.date).toLocaleTimeString()}</span>
                                    </div>
                                    <div>MEHMONLAR: <b>{reservationToPrint.guests} kishi</b></div>
                                    <div>KASSIR: <b>{user?.username || "Kassir"}</b></div>
                                </div>
                                <p style={{ fontWeight: 'bold', margin: '5px 0' }}>BANKET BRONI</p>
                                <hr />
                                <div style={{ padding: '0' }}>
                                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'left', color: '#000' }}>
                                        <thead>
                                            <tr style={{ background: '#f2f2f2' }}>
                                                <th style={{ border: '1px solid #000', width: '10%', padding: '2px', textAlign: 'center' }}>No</th>
                                                <th style={{ border: '1px solid #000', width: '35%', padding: '2px' }}>Nomi</th>
                                                <th style={{ border: '1px solid #000', width: '12%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                                <th style={{ border: '1px solid #000', width: '18%', textAlign: 'right', padding: '2px' }}>Narxi</th>
                                                <th style={{ border: '1px solid #000', width: '25%', textAlign: 'right', padding: '2px' }}>Summa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservationToPrint.items && reservationToPrint.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                                    <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word' }}>{item.name}</td>
                                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                                                    <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <hr />
                                <div style={{ padding: '0' }}>
                                    <div className="receipt-total">
                                        <span>BUYURTMA JAMI:</span>
                                        <span>{reservationToPrint.items ? reservationToPrint.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toLocaleString() : 0}</span>
                                    </div>
                                    <div className="receipt-total">
                                        <span>ZALOG (FAKULTATIV):</span>
                                        <span>{Number(reservationToPrint.deposit || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-total" style={{ borderTop: '1px solid #000', paddingTop: '2px', fontSize: '16px' }}>
                                        <span>QOLDIQ:</span>
                                        <span>{((reservationToPrint.items ? reservationToPrint.items.reduce((sum, i) => sum + (i.price * i.quantity), 0) : 0) - Number(reservationToPrint.deposit || 0)).toLocaleString()}</span>
                                    </div>
                                </div>
                                <style>{`
                                    .print-receipt {
                                        width: 80mm !important;
                                        margin: 0;
                                        background: white;
                                        color: #000000 !important;
                                        font-family: 'Courier New', monospace;
                                        padding: 2mm 3mm;
                                        box-sizing: border-box;
                                        text-align: center;
                                        font-size: 12px;
                                    }
                                    .print-receipt h3 { margin: 0; font-size: 18px; font-weight: bold; }
                                    .print-receipt h2 { margin: 2px 0; font-size: 20px; font-weight: bold; }
                                    .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
                                    hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
                                `}</style>
                            </div>
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
        const [searchQuery, setSearchQuery] = useState('');
        const [filterCategory, setFilterCategory] = useState('Barchasi');

        const filteredMenu = menu.filter(item => {
            const matchesCategory = filterCategory === 'Barchasi' || item.category === filterCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

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
                // Using relative path so it works over ngrok
                const res = await fetch('/upload', {
                    method: 'POST',
                    headers: { 'ngrok-skip-browser-warning': 'true' },
                    body: uploadData,
                });
                const data = await res.json();
                if (data.filePath) {
                    setFormData(prev => ({ ...prev, image: data.filePath })); // Store relative URL
                }
            } catch (err) {
                console.error("Upload failed", err);
                setErrorMsg("Rasm yuklashda xatolik yuz berdi.");
                setShowErrorModal(true);
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

                {/* SEARCH AND FILTER BAR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="text"
                                placeholder="Taom nomini qidiring..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                                    borderRadius: '12px', border: '1px solid #333',
                                    background: '#1a1a1a', color: '#fff', fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Category Tabs */}
                        <div style={{
                            display: 'flex', gap: '0.5rem', overflowX: 'auto',
                            paddingBottom: '0.5rem', flex: 1, justifyContent: 'flex-start'
                        }}>
                            <button
                                onClick={() => setFilterCategory('Barchasi')}
                                style={{
                                    padding: '0.6rem 1.2rem', borderRadius: '10px', whiteSpace: 'nowrap',
                                    background: filterCategory === 'Barchasi' ? 'var(--accent-color)' : '#252525',
                                    color: filterCategory === 'Barchasi' ? '#000' : '#888',
                                    fontWeight: 'bold', border: 'none', cursor: 'pointer'
                                }}
                            >
                                Barchasi
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.name)}
                                    style={{
                                        padding: '0.6rem 1.2rem', borderRadius: '10px', whiteSpace: 'nowrap',
                                        background: filterCategory === cat.name ? 'var(--accent-color)' : '#252525',
                                        color: filterCategory === cat.name ? '#000' : '#888',
                                        fontWeight: 'bold', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
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
                                                    src={formData.image.startsWith('http') ? formData.image : formData.image.startsWith('/') ? formData.image : `/${formData.image}`}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem' }}>
                    {filteredMenu.map(item => (
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
                                            src={item.image.startsWith('http') ? item.image : item.image.startsWith('/') ? item.image : `/${item.image}`} // Simple heuristic
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
    const CategoriesView = ({ categories, addCategory, deleteCategory }) => {
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
        const [qrTable, setQrTable] = useState(null);

        const handleAdd = (e) => {
            e.preventDefault();
            if (newTable.trim()) {
                addTable(newTable.trim());
                setNewTable('');
            }
        };

        const handlePrintQR = () => {
            window.print();
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Joylar (Stollar)</h2>
                </div>

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
                        {tables?.map(table => (
                            <div key={table.id} style={{ background: '#252525', padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #333' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{table.name}</div>
                                    <button
                                        onClick={() => setQrTable(table)}
                                        style={{ background: '#333', color: 'var(--accent-color)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                        title="QR Kod"
                                    >
                                        <FaQrcode size={20} />
                                    </button>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: table.orders?.length > 0 ? '#ef4444' : '#4caf50' }}>
                                    {table.orders?.length > 0 ? 'Band' : 'Bo\'sh'}
                                </div>

                                <button
                                    onClick={() => deleteTable(table.id)}
                                    disabled={table.orders?.length > 0}
                                    style={{
                                        marginTop: 'auto',
                                        background: table.orders?.length > 0 ? '#555' : '#ef4444',
                                        color: '#fff', padding: '0.8rem', borderRadius: '6px',
                                        cursor: table.orders?.length > 0 ? 'not-allowed' : 'pointer',
                                        border: 'none', fontSize: '0.9rem'
                                    }}
                                >
                                    <FaTrash /> O'chirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Modal */}
                {qrTable && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '16px', width: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid #333' }}>
                            <h3 style={{ margin: 0 }}>{qrTable.name} QR Kodi</h3>

                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px' }}>
                                <QRCodeSVG
                                    value={`${window.location.origin}/menu/${qrTable.id}`}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                                Mijoz skaner qilganda bevosita ushbu stol uchun menyu ochiladi.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <button
                                    onClick={() => setQrTable(null)}
                                    style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px' }}
                                >
                                    Yopish
                                </button>
                                <button
                                    onClick={handlePrintQR}
                                    style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-color)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px' }}
                                >
                                    <FaPrint /> CHOP ETISH
                                </button>
                            </div>
                        </div>

                        {/* Hidden print area */}
                        <PrintPortal>
                            <div className="print-qr-code">
                                <h2>LAZZAT KAFE</h2>
                                <h1 style={{ fontSize: '40px', margin: '10px 0' }}>{qrTable.name}</h1>
                                <div style={{ background: '#fff', padding: '10px', display: 'inline-block' }}>
                                    <QRCodeSVG
                                        value={`${window.location.origin}/menu/${qrTable.id}`}
                                        size={300}
                                        level={"H"}
                                    />
                                </div>
                                <p style={{ fontSize: '18px', marginTop: '20px' }}>Telefoningizda skaner qiling va buyurtma bering!</p>
                                <style>{`
                                    @media print {
                                        .print-qr-code {
                                            display: block !important;
                                            text-align: center;
                                            padding: 50px;
                                            color: #000 !important;
                                            width: ${settings.cashierPrinterWidth || 72}mm !important;
                                        }
                                    }
                                    .print-qr-code { display: none; }
                                `}</style>
                            </div>
                        </PrintPortal>
                    </div>
                )}
            </div>
        );
    };

    // 4. HISTORY VIEW
    const HistoryView = () => {
        const handleCloseDay = () => {
            const hasBusyTables = tables.some(t => t.orders && t.orders.length > 0);
            const hasActiveSaboy = saboyOrders && saboyOrders.length > 0;

            if (hasBusyTables || hasActiveSaboy) {
                setErrorMsg("Diqqat! Hozirda yopilmagan (hisoblanmagan) stollar yoki Saboy buyurtmalari mavjud! Iltimos, avval barcha faol buyurtmalarni yopib, so'ngra kassani yakunlang.");
                setShowErrorModal(true);
                return;
            }

            openPasswordPrompt(() => {
                const stats = calculateDailyStats();
                setDailyStats(stats);
                setShowDailyReport(true);

                setTimeout(() => {
                    // Force a small delay to ensure React has rendered the portal
                    window.print();
                    openConfirm(
                        "Kunni yakunlash",
                        "Kunlik hisobot chop etildimi? Tarixni tozalab, yangi kunni boshlaymizmi?",
                        () => {
                            closeDay(stats);
                            setShowDailyReport(false);
                        }
                    );
                }, 1500);
            });
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
                                    <th style={{ padding: '0.5rem' }}>Stol / Mijoz</th>
                                    <th style={{ padding: '0.5rem' }}>Summa</th>
                                    <th style={{ padding: '0.5rem' }}>To'lov Turi</th>
                                    <th style={{ padding: '0.5rem' }}>Izoh</th>
                                </tr>
                            </thead>
                            <tbody>
                                {completedOrders.map((order, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '0.5rem' }}>{new Date(order.timestamp).toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {order.isSaboy ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>SABOY: {order.customerName}</span>
                                                    {order.phone && <span style={{ fontSize: '0.8rem', color: '#888' }}>{order.phone}</span>}
                                                </div>
                                            ) : (tables?.find(t => String(t.id) === String(order.tableId))?.name || `Stol ${order.tableId}`)}
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>{order.total.toLocaleString()}</td>
                                        <td style={{ padding: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>{order.paymentMethod}</td>
                                        <td style={{ padding: '0.5rem', color: '#888', fontSize: '0.8rem', fontStyle: 'italic' }}>{order.note || ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        );
    };


    // 5. STATISTICS VIEW (Enhanced)
    const StatsView = () => {
        const { completedOrders, archives, expenses } = useData();
        const [filterType, setFilterType] = useState('today'); // today, month, year, custom
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');

        // Helper: Get all orders (History + Archives)
        const getAllOrders = () => {
            let all = [...completedOrders];
            archives.forEach(arch => {
                if (arch.orders && Array.isArray(arch.orders)) all = all.concat(arch.orders);
            });
            return all;
        };

        const getFilteredData = () => {
            const allOrders = getAllOrders();
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            const filterFn = (item) => {
                const date = new Date(item.timestamp || item.date).getTime();
                const dObj = new Date(item.timestamp || item.date);

                if (filterType === 'today') return date >= startOfDay;
                if (filterType === 'month') return dObj.getMonth() === now.getMonth() && dObj.getFullYear() === now.getFullYear();
                if (filterType === 'year') return dObj.getFullYear() === now.getFullYear();
                if (filterType === 'custom') {
                    if (!startDate || !endDate) return true;
                    const start = new Date(startDate).getTime();
                    const end = new Date(endDate).getTime() + 86400000;
                    return date >= start && date < end;
                }
                return true;
            };

            const filteredOrders = allOrders.filter(filterFn);
            const filteredExpenses = expenses.filter(filterFn);
            return { filteredOrders, filteredExpenses };
        };

        const { filteredOrders, filteredExpenses } = getFilteredData();

        // Totals
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
                } else totalCash += order.total;
            }
        });

        const totalExpenseAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = totalRevenue - totalExpenseAmount;

        // Employee Performance
        const employeeStats = {};
        filteredOrders.forEach(order => {
            const waiter = order.waiterName || 'Noma\'lum';
            if (!employeeStats[waiter]) employeeStats[waiter] = { revenue: 0, orders: 0 };
            employeeStats[waiter].revenue += order.total;
            employeeStats[waiter].orders += 1;
        });
        const performanceList = Object.entries(employeeStats).sort((a, b) => b[1].revenue - a[1].revenue);

        // Top Items calculation
        const itemCounts = {};
        filteredOrders.forEach(order => {
            order.items?.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        const topItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Kengaytirilgan Statistika</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#252525', padding: '0.4rem', borderRadius: '10px' }}>
                        {['today', 'month', 'year', 'custom'].map(type => (
                            <button key={type} onClick={() => setFilterType(type)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: filterType === type ? 'var(--accent-color)' : 'transparent', color: filterType === type ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                {type === 'today' ? 'Bugun' : type === 'month' ? 'Oy' : type === 'year' ? 'Yil' : 'Davr'}
                            </button>
                        ))}
                    </div>
                </div>

                {filterType === 'custom' && (
                    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', background: '#252525', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #444' }} />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #444' }} />
                    </div>
                )}

                {/* Main Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Jami Tushum</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{totalRevenue.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>UZS</span></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #451a1a, #2a0a0a)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #7f1d1d' }}>
                        <div style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Jami Xarajat</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{totalExpenseAmount.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>UZS</span></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #065f46' }}>
                        <div style={{ color: '#6ee7b7', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Sof Foyda</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{netProfit.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>UZS</span></div>
                    </div>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Payment Breakdown */}
                    <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>To'lov turlari</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { label: 'Naqd', value: totalCash, color: '#4caf50' },
                                { label: 'Plastik', value: totalCard, color: '#2196f3' },
                                { label: 'Click', value: totalClick, color: '#ff9800' }
                            ].map(item => {
                                const percent = totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0;
                                return (
                                    <div key={item.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                            <span>{item.label}</span>
                                            <span style={{ color: '#aaa' }}>{item.value.toLocaleString()} UZS</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: item.color, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Employee Performance */}
                    <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Xodimlar natijalari (Sotuv)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {performanceList.length === 0 ? <p style={{ color: '#666' }}>Ma'lumot yo'q</p> : performanceList.slice(0, 5).map(([name, data]) => {
                                const maxRev = performanceList[0][1].revenue;
                                const percent = (data.revenue / maxRev) * 100;
                                return (
                                    <div key={name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                            <span>{name}</span>
                                            <span style={{ color: 'var(--accent-color)' }}>{data.revenue.toLocaleString()} UZS</span>
                                        </div>
                                        <div style={{ height: '10px', background: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: '#6366f1', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Items */}
                <div style={{ background: '#1e1e1e', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Eng ko'p sotilgan taomlar</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {topItems.map(([name, count], i) => (
                            <div key={name} style={{ background: '#252525', padding: '1.2rem', borderRadius: '12px', border: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontWeight: 'bold' }}>#{i + 1}</span>
                                    <span style={{ fontWeight: '500' }}>{name}</span>
                                </div>
                                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{count} ta</span>
                            </div>
                        ))}
                        {topItems.length === 0 && <p style={{ color: '#666' }}>Ma'lumot yo'q</p>}
                    </div>
                </div>
            </div>
        );
    };

    // 5.2 EXPENSES VIEW
    const ExpensesView = () => {
        const { expenses, addExpense, deleteExpense } = useData();
        const [newExpense, setNewExpense] = useState({ category: '', amount: '', comment: '', date: new Date().toISOString().split('T')[0] });

        // Filter states
        const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // Default: Current Month
        const [categoryFilter, setCategoryFilter] = useState('Barchasi');

        const categories = ['Barchasi', ...new Set(expenses.map(e => e.category))];

        const filteredExpenses = expenses.filter(exp => {
            const expMonth = new Date(exp.date).toISOString().slice(0, 7);
            const matchesMonth = monthFilter === '' || expMonth === monthFilter;
            const matchesCategory = categoryFilter === 'Barchasi' || exp.category === categoryFilter;
            return matchesMonth && matchesCategory;
        });

        const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!newExpense.category || !newExpense.amount) {
                setErrorMsg("Iltimos, kategoriya va summani kiriting!");
                setShowErrorModal(true);
                return;
            }
            addExpense({ ...newExpense, amount: Number(newExpense.amount) });
            setNewExpense({ category: '', amount: '', comment: '', date: new Date().toISOString().split('T')[0] });
        };

        return (
            <div>
                <h2>Xarajatlar (Rasxod)</h2>
                <div style={{ background: '#252525', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '2rem', maxWidth: '800px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: '#888', fontSize: '0.8rem' }}>Kategoriya</label>
                            <input
                                placeholder="Masalan: Bozor, Ijara..."
                                value={newExpense.category}
                                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: '#888', fontSize: '0.8rem' }}>Summa</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={newExpense.amount}
                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ color: '#888', fontSize: '0.8rem' }}>Sana</label>
                            <input
                                type="date"
                                value={newExpense.date}
                                onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff', colorScheme: 'dark' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                            <label style={{ color: '#888', fontSize: '0.8rem' }}>Izoh</label>
                            <input
                                placeholder="Qo'shimcha ma'lumot..."
                                value={newExpense.comment}
                                onChange={e => setNewExpense({ ...newExpense, comment: e.target.value })}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button type="submit" style={{ width: '100%', padding: '0.8rem', background: 'var(--accent-color)', color: '#000', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                                QO'SHISH
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: '#1a1a1a', padding: '1.2rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <label style={{ color: '#888', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Sana (Oy):</label>
                        <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff', colorScheme: 'dark' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <label style={{ color: '#888', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Kategoriya:</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #444', background: '#333', color: '#fff' }}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Filtr bo'yicha jami:</div>
                        <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>-{filteredTotal.toLocaleString()} UZS</div>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #555', color: '#888' }}>
                            <th style={{ padding: '1rem' }}>Sana</th>
                            <th style={{ padding: '1rem' }}>Kategoriya</th>
                            <th style={{ padding: '1rem' }}>Izoh</th>
                            <th style={{ padding: '1rem' }}>Summa</th>
                            <th style={{ padding: '1rem' }}>Amal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.slice().reverse().map(exp => (
                            <tr key={exp.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '1rem' }}>{new Date(exp.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>{exp.category}</td>
                                <td style={{ padding: '1rem', color: '#aaa' }}>{exp.comment}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#ef4444' }}>-{exp.amount.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => deleteExpense(exp.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    // --- ATTENDANCE CALENDAR COMPONENT ---
    const AttendanceCalendar = ({ logs }) => {
        const [viewDate, setViewDate] = useState(new Date());

        const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const startDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust for Monday start

        const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

        const groupedLogs = logs.reduce((acc, log) => {
            const d = new Date(log.timestamp);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            if (!acc[key]) acc[key] = { hasCheckIn: false, hasCheckOut: false, earnings: 0 };
            if (log.type === 'check-in') acc[key].hasCheckIn = true;
            if (log.type === 'check-out') {
                acc[key].hasCheckOut = true;
                acc[key].earnings += log.earnings || 0;
            }
            return acc;
        }, {});

        const navigateMonth = (offset) => {
            const newDate = new Date(viewDate.setMonth(viewDate.getMonth() + offset));
            setViewDate(new Date(newDate));
        };

        const days = [];
        for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} style={{ height: '50px' }}></div>);
        for (let d = 1; d <= daysCount; d++) {
            const key = `${year}-${month + 1}-${d}`;
            const data = groupedLogs[key];
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

            days.push(
                <div key={d} style={{
                    height: '55px',
                    background: isToday ? 'rgba(255, 215, 0, 0.1)' : '#1a1a1a',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: isToday ? '1px solid var(--accent-color)' : '1px solid #333',
                    transition: '0.2s',
                    cursor: data ? 'pointer' : 'default'
                }}>
                    <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--accent-color)' : '#888', fontWeight: isToday ? 'bold' : 'normal' }}>{d}</span>
                    {data && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                {data.hasCheckIn && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }}></div>}
                                {data.hasCheckOut && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }}></div>}
                            </div>
                            {data.earnings > 0 && <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 'bold' }}>{Math.round(data.earnings / 1000)}k</span>}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{ background: '#222', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => navigateMonth(-1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>&lt;</button>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{monthNames[month]} {year}</span>
                    <button onClick={() => navigateMonth(1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>&gt;</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '8px' }}>
                    {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map(day => (
                        <span key={day} style={{ fontSize: '0.65rem', color: '#555', fontWeight: 'bold' }}>{day}</span>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {days}
                </div>
            </div>
        );
    };

    // 5.3 EMPLOYEES VIEW
    const EmployeesView = () => {
        const { employees, attendance, addEmployee, updateEmployee, deleteEmployee, addAdvance, deleteAdvance, updateEmployeeSalary, logAttendance } = useData();
        const [isAdding, setIsAdding] = useState(false);
        const [editingId, setEditingId] = useState(null);
        const [formData, setFormData] = useState({
            name: '', role: 'Ofitsiant', phone: '', status: 'active',
            salary: '', salaryType: 'soatbay', dailyHours: 10, startTime: '09:00', endTime: '19:00'
        });
        const [selectedEmployee, setSelectedEmployee] = useState(null);

        // Auto-calculate dailyHours when startTime or endTime changes
        useEffect(() => {
            if (!isAdding) return;
            const calculateShiftHours = () => {
                const [sH, sM] = formData.startTime.split(':').map(Number);
                const [eH, eM] = formData.endTime.split(':').map(Number);
                if (isNaN(sH) || isNaN(eH)) return;

                let diff = (eH * 60 + eM) - (sH * 60 + sM);
                if (diff <= 0) diff += 24 * 60; // Overnight
                const hours = parseFloat((diff / 60).toFixed(1));

                if (formData.dailyHours !== hours) {
                    setFormData(prev => ({ ...prev, dailyHours: hours }));
                }
            };
            calculateShiftHours();
        }, [formData.startTime, formData.endTime, isAdding]);

        const handleSubmit = (e) => {
            e.preventDefault();
            const data = {
                ...formData,
                salary: Number(formData.salary),
                dailyHours: Number(formData.dailyHours)
            };
            if (editingId) {
                updateEmployee({ ...data, id: editingId });
                setEditingId(null);
            } else {
                addEmployee(data);
            }
            setIsAdding(false);
            setFormData({
                name: '', role: 'Ofitsiant', phone: '', status: 'active',
                salary: '', salaryType: 'soatbay', dailyHours: 10, startTime: '09:00', endTime: '19:00'
            });
        };

        const DetailModal = ({ employee, onClose }) => {
            const [advAmount, setAdvAmount] = useState('');
            const [advNote, setAdvNote] = useState('');

            const totalAdvances = (employee.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
            const totalEarnings = employee.totalEarnings || 0;
            const balance = totalEarnings - totalAdvances;

            const handleAddAdvance = (e) => {
                e.preventDefault();
                if (!advAmount) return;
                addAdvance(employee.id, advAmount, new Date().toISOString(), advNote);
                setAdvAmount('');
                setAdvNote('');
            };

            const empAttendance = attendance.filter(a => a.employeeId === employee.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '20px', width: '850px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{employee.name}</h2>
                                <span style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>{employee.role} | {employee.startTime} - {employee.endTime} ({employee.dailyHours} soat)</span>
                            </div>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><FaTimes size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                            <div style={{ background: '#252525', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                                <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>рџ’° Moliyaviy Holat</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Jami Ishlagan</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)', marginTop: '0.3rem' }}>{totalEarnings.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Rasxod</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff4444', marginTop: '0.3rem' }}>{totalAdvances.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--success)', color: '#fff', padding: '1rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: 'bold' }}>HAQIQIY QOLDIQ</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{balance.toLocaleString()} so'm</div>
                                </div>

                                <h4 style={{ marginBottom: '0.5rem' }}>+ Rasxod qo'shish</h4>
                                <form onSubmit={handleAddAdvance} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input type="number" placeholder="Summa" value={advAmount} onChange={e => setAdvAmount(e.target.value)} style={{ padding: '0.6rem', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '8px' }} />
                                    <input placeholder="Izoh" value={advNote} onChange={e => setAdvNote(e.target.value)} style={{ padding: '0.6rem', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '8px' }} />
                                    <button style={{ background: 'var(--success)', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '8px', fontWeight: 'bold', marginTop: '0.5rem' }}>SAQLASH</button>
                                </form>

                                <div style={{ marginTop: '1.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Tarix:</div>
                                    {(employee.advances || []).map(a => (
                                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#1a1a1a', padding: '0.5rem 0.8rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{Number(a.amount).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(a.date).toLocaleDateString()} {a.note && `- ${a.note}`}</div>
                                            </div>
                                            <button onClick={() => deleteAdvance(employee.id, a.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#252525', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>рџ“… Davomat</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: employee.isAtWork ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', color: employee.isAtWork ? 'var(--success)' : '#888', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: employee.isAtWork ? 'var(--success)' : '#888' }}></div>
                                        {employee.isAtWork ? 'ISHDA' : 'ISHDA EMAS'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button onClick={() => logAttendance(employee.id, 'check-in')} disabled={employee.isAtWork} style={{ flex: 1, padding: '1rem', background: employee.isAtWork ? '#333' : 'var(--success)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: employee.isAtWork ? 'default' : 'pointer', opacity: employee.isAtWork ? 0.5 : 1 }}>ISHDA</button>
                                    <button onClick={() => logAttendance(employee.id, 'check-out')} disabled={!employee.isAtWork} style={{ flex: 1, padding: '1rem', background: !employee.isAtWork ? '#333' : '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: !employee.isAtWork ? 'default' : 'pointer', opacity: !employee.isAtWork ? 0.5 : 1 }}>ISHDA EMAS</button>
                                </div>

                                {/* CALENDAR VIEW */}
                                <AttendanceCalendar logs={empAttendance} />

                                <div style={{ marginTop: '1.5rem', maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Oxirgi harakatlar:</div>
                                    {empAttendance.length === 0 ? <p style={{ color: '#666', fontSize: '0.85rem' }}>Ma'lumot mavjud emas</p> : empAttendance.map(log => (
                                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '0.4rem', borderLeft: `3px solid ${log.type === 'check-in' ? '#10b981' : '#ef4444'}`, fontSize: '0.85rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{log.type === 'check-in' ? 'Ishda' : 'Ishda emas'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(log.timestamp).toLocaleString()}</div>
                                            </div>
                                            {log.type === 'check-out' && log.earnings && (
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>+{log.earnings.toLocaleString()}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: 0 }}>Xodimlar Boshqaruvi</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.9rem' }}>Soatbay ish haqi va real vaqtda balans</p>
                    </div>
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', role: 'Ofitsiant', phone: '', status: 'active', salary: '', salaryType: 'soatbay', dailyHours: 10, startTime: '09:00', endTime: '19:00' }); }}
                        style={{ padding: '0.8rem 1.8rem', background: 'var(--accent-color)', color: '#000', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    >
                        <FaPlus /> Yangi Xodim
                    </button>
                </div>

                {isAdding && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#252525', padding: '2.5rem', borderRadius: '20px', width: '500px', border: '1px solid #444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>{editingId ? 'Tahrirlash' : 'Yangi Xodim'}</h3>
                                <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><FaTimes size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>F.I.O</label>
                                    <input autoFocus value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Lavozim</label>
                                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }}>
                                            <option>Ofitsiant</option><option>Oshpaz</option><option>Kassir</option><option>Boshqa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>{formData.salaryType === 'kunbay' ? 'Kunlik Ish Haqi' : 'Oylik Maosh'}</label>
                                        <input type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Ish Vaqti (Dan)</label>
                                        <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Ish Vaqti (Gacha)</label>
                                        <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Smena Soati (kunlik)</label>
                                        <input type="number" readOnly value={formData.dailyHours} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#222', color: '#888', cursor: 'not-allowed' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Maosh Turi</label>
                                        <select value={formData.salaryType} onChange={e => setFormData({ ...formData, salaryType: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }}>
                                            <option value="soatbay">Soatbay</option>
                                            <option value="kunbay">Kunbay (Fixed)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#888', fontSize: '0.85rem' }}>Telefon</label>
                                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #444', background: '#333', color: '#fff' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setIsAdding(false)} style={{ flex: 1, padding: '1rem', background: '#333', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>BEKOR</button>
                                    <button type="submit" style={{ flex: 2, padding: '1rem', background: 'var(--success)', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>SAQLASH</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {employees.map(emp => {
                        const totalAdvances = (emp.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
                        const totalEarnings = emp.totalEarnings || 0;
                        const balance = totalEarnings - totalAdvances;
                        return (
                            <div
                                key={emp.id}
                                style={{
                                    background: 'linear-gradient(145deg, #2a2a2a, #222)',
                                    padding: '1.8rem',
                                    borderRadius: '24px',
                                    border: '1px solid #3a3a3a',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.2rem',
                                    position: 'relative',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#3a3a3a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                }}
                                onClick={() => setSelectedEmployee(emp)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                            <span style={{
                                                background: 'rgba(255, 215, 0, 0.1)',
                                                color: 'var(--accent-color)',
                                                padding: '4px 12px',
                                                borderRadius: '10px',
                                                fontSize: '0.75rem',
                                                fontWeight: '900',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}>{emp.role}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: emp.isAtWork ? '#10b981' : '#666',
                                                    boxShadow: emp.isAtWork ? '0 0 10px #10b981' : 'none'
                                                }}></div>
                                                <span style={{ fontSize: '0.75rem', color: emp.isAtWork ? '#10b981' : '#888', fontWeight: 'bold' }}>
                                                    {emp.isAtWork ? 'ISHDA' : 'ISHDA EMAS'}
                                                </span>
                                            </div>
                                        </div>
                                        <h2 style={{ margin: '0.3rem 0', fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>{emp.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>рџ•’ {emp.startTime} - {emp.endTime}</span>
                                            <span style={{ opacity: 0.3 }}>|</span>
                                            <span>{emp.dailyHours} soat</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => { setEditingId(emp.id); setFormData(emp); setIsAdding(true); }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#aaa',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#aaa'; }}
                                        >
                                            <FaEdit size={22} />
                                        </button>
                                        <button
                                            onClick={() => deleteEmployee(emp.id)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            <FaTrash size={22} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '1.2rem',
                                    borderRadius: '20px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1.5rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>ISHLADI</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-color)' }}>{totalEarnings.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>UZS</span></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>BALANS</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: balance >= 0 ? '#10b981' : '#ef4444' }}>{balance.toLocaleString()} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>UZS</span></div>
                                    </div>
                                </div>
                                
                                {emp.waiterAuth && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 78, 59, 0.2))',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        marginTop: '0.5rem'
                                    }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaLock size={12} /> Ofitsiant Ruxsati
                                            </span>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if(window.confirm('Ushbu ofitsiantning tizimga kirish huquqini bekor qilasizmi?')) {
                                                        updateEmployee({ ...emp, waiterAuth: null });
                                                    }
                                                }}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', padding: 0 }}
                                            >
                                                Bekor qilish
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.5)' }}>
                                            <span>Login: <b style={{ color: '#fff' }}>{emp.waiterAuth.username}</b></span>
                                            <span>Parol: <b style={{ color: '#fff' }}>{emp.waiterAuth.password}</b></span>
                                        </div>
                                    </div>
                                )}




                                <div style={{
                                    fontSize: '0.85rem',
                                    color: '#555',
                                    textAlign: 'center',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '0.8rem',
                                    marginTop: '1rem',
                                    fontWeight: '500'
                                }}>
                                    рџ“ћ {emp.phone || 'Noma\'lum'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {selectedEmployee && <DetailModal employee={employees.find(e => e.id === selectedEmployee.id) || selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
            </div>
        );
    };

    // 5.4 SETTLEMENT VIEW (Oylik Hisob-Kitob)
    const SettlementView = () => {
        const { employees, settleEmployee } = useData();
        const [settleEmp, setSettleEmp] = useState(null);
        const [bonus, setBonus] = useState('');
        const [penalty, setPenalty] = useState('');
        const [amountPaid, setAmountPaid] = useState('');
        const [note, setNote] = useState('');

        // Reset inputs when selected employee changes
        useEffect(() => {
            if (settleEmp) {
                setBonus('');
                setPenalty('');
                setNote('');
                const totalAdvances = (settleEmp.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
                const totalEarnings = settleEmp.totalEarnings || 0;
                setAmountPaid((totalEarnings - totalAdvances).toString());
            }
        }, [settleEmp]);

        // Reactive update for payment amount
        useEffect(() => {
            if (settleEmp) {
                const totalAdvances = (settleEmp.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
                const totalEarnings = settleEmp.totalEarnings || 0;
                const base = totalEarnings - totalAdvances;
                const calcTotal = base + (Number(bonus) || 0) - (Number(penalty) || 0);
                setAmountPaid(calcTotal.toString());
            }
        }, [bonus, penalty]);

        const handleFinalSettle = () => {
            if (!settleEmp) return;
            settleEmployee(settleEmp.id, {
                bonus: Number(bonus) || 0,
                penalty: Number(penalty) || 0,
                amountPaid: Number(amountPaid),
                note
            });
            setSettleEmp(null);
        };

        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <FaWallet size={30} color="var(--accent-color)" />
                    <h2 style={{ margin: 0 }}>Oylik Hisob-Kitob</h2>
                </div>

                <div style={{ background: '#222', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
                                <th style={{ padding: '1.2rem', color: '#888' }}>Xodim</th>
                                <th style={{ padding: '1.2rem', color: '#888' }}>Lavozim</th>
                                <th style={{ padding: '1.2rem', color: '#888' }}>Ishladi</th>
                                <th style={{ padding: '1.2rem', color: '#888' }}>Rasxod (Bo'nak)</th>
                                <th style={{ padding: '1.2rem', color: '#888' }}>Balans</th>
                                <th style={{ padding: '1.2rem', color: '#888', textAlign: 'right' }}>Amal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => {
                                const totalAdvances = (emp.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
                                const totalEarnings = emp.totalEarnings || 0;
                                const balance = totalEarnings - totalAdvances;

                                return (
                                    <tr key={emp.id} style={{ borderBottom: '1px solid #2a2a2a', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#252525'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{emp.name}</td>
                                        <td style={{ padding: '1.2rem', color: '#ccc' }}>{emp.role}</td>
                                        <td style={{ padding: '1.2rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{totalEarnings.toLocaleString()}</td>
                                        <td style={{ padding: '1.2rem', color: '#ff4444' }}>{totalAdvances.toLocaleString()}</td>
                                        <td style={{ padding: '1.1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                background: balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: balance >= 0 ? '#10b981' : '#ef4444',
                                                fontWeight: 'bold'
                                            }}>
                                                {balance.toLocaleString()} so'm
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSettleEmp(emp)}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    background: 'var(--success)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                HISOB-KITOB QILISH
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* SETTLEMENT MODAL */}
                {settleEmp && (() => {
                    const totalAdvances = (settleEmp.advances || []).reduce((sum, a) => sum + Number(a.amount), 0);
                    const totalEarnings = settleEmp.totalEarnings || 0;
                    const baseBalance = totalEarnings - totalAdvances;
                    const finalPayment = baseBalance + (Number(bonus) || 0) - (Number(penalty) || 0);

                    return (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                            <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '24px', width: '500px', border: '1px solid #333', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ margin: 0 }}>Hisob-Kitob: {settleEmp.name}</h2>
                                    <button onClick={() => setSettleEmp(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><FaTimes size={24} /></button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#252525', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Ishladi</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{totalEarnings.toLocaleString()}</div>
                                    </div>
                                    <div style={{ background: '#252525', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>Rasxod</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff4444' }}>{totalAdvances.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#aaa', fontSize: '0.85rem' }}>Bonus (+)</label>
                                        <input type="number" placeholder="Summa" value={bonus} onChange={e => setBonus(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#10b981', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#aaa', fontSize: '0.85rem' }}>Shtraf (-)</label>
                                        <input type="number" placeholder="Summa" value={penalty} onChange={e => setPenalty(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#ef4444', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold' }} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', color: '#aaa', fontSize: '0.85rem' }}>Izoh</label>
                                    <input placeholder="Ixtiyoriy yozuv..." value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '10px' }} />
                                </div>

                                <div style={{ background: 'var(--success)', padding: '1rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)' }}>
                                    <div style={{ opacity: 0.8, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Mavjud Mablag' (max)</div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{finalPayment.toLocaleString()} so'm</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 'bold' }}>To'lanadigan Summa</label>
                                        <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} style={{ width: '100%', padding: '1rem', background: '#333', border: '2px solid var(--accent-color)', color: '#fff', borderRadius: '12px', fontSize: '1.3rem', fontWeight: '900' }} />
                                    </div>
                                    <div style={{ background: '#222', padding: '0.8rem', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 'bold' }}>Qoladigan Qoldiq</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: (finalPayment - Number(amountPaid)) > 0 ? 'var(--accent-color)' : '#888' }}>
                                            {(finalPayment - Number(amountPaid)).toLocaleString()} so'm
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setSettleEmp(null)} style={{ flex: 1, padding: '1.2rem', background: '#333', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>BEKOR</button>
                                    <button onClick={handleFinalSettle} disabled={!amountPaid || Number(amountPaid) < 0} style={{ flex: 2, padding: '1.2rem', background: 'var(--success)', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', opacity: (!amountPaid || Number(amountPaid) < 0) ? 0.5 : 1 }}>HISOB-KITOBNI YAKUNLASH</button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Eski Z-Reportlar (Arxiv)</h2>
                    {archives.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm("Barcha arxivlarni butunlay o'chirib yubormoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!")) {
                                    clearArchives();
                                }
                            }}
                            style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                        >
                            Barcha arxivlarni tozalash
                        </button>
                    )}
                </div>
                <div style={{ marginTop: '1rem' }}>
                    {archives.length === 0 ? <p style={{ color: '#666' }}>Arxiv bo'sh</p> : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {archives.slice().reverse().map((arch) => (
                                <div key={arch.id} style={{ background: '#252525', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <h4 style={{ color: 'var(--accent-color)' }}>{new Date(arch.date).toLocaleDateString()}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(arch.date).toLocaleTimeString()}</span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', padding: '0.5rem 0', borderTop: '1px dashed #444', borderBottom: '1px dashed #444' }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("Ushbu arxivni o'chirishni tasdiqlaysizmi?")) {
                                                        deleteArchive(arch.id);
                                                    }
                                                }}
                                                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                O'chirish
                                            </button>
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
                                                        <th style={{ padding: '0.5rem' }}>Stol / Mijoz</th>
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
                                                            <td style={{ padding: '0.5rem' }}>
                                                                {order.isSaboy ? (
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>SABOY: {order.customerName}</span>
                                                                        {order.phone && <span style={{ fontSize: '0.75rem', color: '#888' }}>{order.phone}</span>}
                                                                    </div>
                                                                ) : (tables?.find(t => String(t.id) === String(order.tableId))?.name || `Stol ${order.tableId}`)}
                                                            </td>
                                                            <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ccc' }}>
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx}>{item.quantity} x {item.name}</div>
                                                                ))}
                                                                {order.note && <div style={{ color: 'var(--accent-color)', marginTop: '0.2rem', fontStyle: 'italic' }}>Izoh: {order.note}</div>}
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
                        <div className="print-receipt">
                            <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                            <p style={{ fontSize: '11px' }}>{settings.address || "Toshkent sh., Chilonzor tumani"}</p>
                            <p style={{ fontSize: '11px' }}>Tel: {settings.phone || "+998 90 123 45 67"}</p>
                            <hr />
                            <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>STOL: <b>{receiptOrder.isSaboy ? `SABOY (${receiptOrder.customerName})` : (tables?.find(t => String(t.id) === String(receiptOrder.tableId))?.name || `Stol ${receiptOrder.tableId}`)}</b></span>
                                    <span>BUYURTMA: #<b>{receiptOrder.id.slice(-6).toUpperCase()}</b></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SANA: {new Date(receiptOrder.timestamp).toLocaleDateString()}</span>
                                    <span>VAQT: {new Date(receiptOrder.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div>KASSIR: <b>{user?.username || "Kassir"}</b></div>
                            </div>
                            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>CHEK NUSXASI (Arxiv)</p>
                            <hr />
                            <div style={{ padding: '0' }}>
                                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'left', color: '#000' }}>
                                    <thead>
                                        <tr style={{ background: '#f2f2f2' }}>
                                            <th style={{ border: '1px solid #000', width: '10%', padding: '2px', textAlign: 'center' }}>No</th>
                                            <th style={{ border: '1px solid #000', width: '35%', padding: '2px' }}>Nomi</th>
                                            <th style={{ border: '1px solid #000', width: '12%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                            <th style={{ border: '1px solid #000', width: '18%', textAlign: 'right', padding: '2px' }}>Narxi</th>
                                            <th style={{ border: '1px solid #000', width: '25%', textAlign: 'right', padding: '2px' }}>Summa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receiptOrder.items.map((item, i) => (
                                            <tr key={i}>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word' }}>{item.name}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <div style={{ padding: '0' }}>
                                <div className="receipt-total">
                                    <span>JAMI:</span>
                                    <span>{receiptOrder.total.toLocaleString()}</span>
                                </div>
                                <hr />
                                <div style={{ textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                    TO'LOV TURI: {receiptOrder.paymentMethod}
                                </div>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px' }}>Qayta chop etildi</p>
                            <style>{`
                                .print-receipt {
                                    width: 80mm !important;
                                    margin: 0;
                                    background: white;
                                    color: #000000 !important;
                                    font-family: 'Courier New', monospace;
                                    padding: 2mm 3mm;
                                    box-sizing: border-box;
                                    text-align: center;
                                    font-size: 12px;
                                }
                                .print-receipt h3 { margin: 0; font-size: 18px; font-weight: bold; }
                                .print-receipt h2 { margin: 2px 0; font-size: 20px; font-weight: bold; }
                                .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
                                hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
                            `}</style>
                        </div>
                    </PrintPortal>
                )}
            </div >
        );
    };

    // 7. SETTINGS VIEW
    const SaboyView = () => {
        const { saboyOrders, checkoutSaboyOrder, menu, categories, placeSaboyOrder, settings } = useData();
        const [showAddModal, setShowAddModal] = useState(false);
        const [showPaymentModal, setShowPaymentModal] = useState(false);
        const [showSaboyConfirmModal, setShowSaboyConfirmModal] = useState(false);
        const [pendingSaboyCheckout, setPendingSaboyCheckout] = useState(null);
        const [selectedOrder, setSelectedOrder] = useState(null);
        const [customerName, setCustomerName] = useState('');
        const [customerPhone, setCustomerPhone] = useState('');
        const [orderNote, setOrderNote] = useState('');
        const [cart, setCart] = useState([]);
        const [search, setSearch] = useState('');
        const [activeCategory, setActiveCategory] = useState('All');

        const filteredMenu = menu.filter(m =>
            (activeCategory === 'All' || m.category === activeCategory) &&
            m.name.toLowerCase().includes(search.toLowerCase())
        );

        const addToCart = (item) => {
            setCart(prev => {
                const existing = prev.find(i => i.id === item.id);
                if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                return [...prev, { ...item, quantity: 1 }];
            });
        };

        const updateQty = (id, delta) => {
            setCart(prev => prev.map(i => {
                if (i.id === id) {
                    const newQty = i.quantity + delta;
                    return newQty > 0 ? { ...i, quantity: newQty } : i;
                }
                return i;
            }));
        };

        const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

        const handlePlaceOrder = () => {
            if (cart.length === 0) return alert("Savat bo'sh!");
            placeSaboyOrder(cart, customerName || 'Saboy', customerPhone, orderNote);
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            setOrderNote('');
            setShowAddModal(false);
        };

        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FaUtensils size={30} color="var(--accent-color)" />
                        <h2 style={{ margin: 0 }}>Saboy (Olib ketish)</h2>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{ padding: '0.8rem 2rem', background: 'var(--success)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <FaPlus /> YANGI BUYURTMA
                    </button>
                </div>

                {/* Active Saboy Orders */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {saboyOrders.length === 0 && <p style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center' }}>Hozircha saboy buyurtmalar yo'q.</p>}
                    {saboyOrders.map(order => (
                        <div key={order.id} style={{ background: '#222', borderRadius: '12px', border: '1px solid #333', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '4px solid var(--accent-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-color)' }}>{order.customerName}</span>
                                    {order.phone && <span style={{ fontSize: '0.8rem', color: '#888' }}>{order.phone}</span>}
                                </div>
                                <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{new Date(order.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ flex: 1, fontSize: '0.9rem' }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span style={{ color: '#aaa' }}>{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                {order.note && (
                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#333', borderRadius: '4px', fontSize: '0.8rem', fontStyle: 'italic', borderLeft: '2px solid var(--accent-color)' }}>
                                        Izoh: {order.note}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                <span>Jami:</span>
                                <span>{order.total.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowPaymentModal(true);
                                }}
                                style={{ width: '100%', padding: '0.8rem', background: 'var(--accent-color)', color: '#000', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                YOPISH
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Order Modal */}
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', padding: '2rem' }}>
                        <div style={{ flex: 2, background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333', marginRight: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', gap: '1rem' }}>
                                <input
                                    placeholder="Qidirish..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ flex: 1, padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
                                    <button onClick={() => setActiveCategory('All')} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: activeCategory === 'All' ? 'var(--accent-color)' : '#333', color: activeCategory === 'All' ? '#000' : '#fff', border: 'none', whiteSpace: 'nowrap' }}>Hammasi</button>
                                    {categories.map(c => (
                                        <button key={c.id} onClick={() => setActiveCategory(c.name)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: activeCategory === c.name ? 'var(--accent-color)' : '#333', color: activeCategory === c.name ? '#000' : '#fff', border: 'none', whiteSpace: 'nowrap' }}>{c.name}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', alignContent: 'start' }}>
                                {filteredMenu.map(item => (
                                    <div key={item.id} onClick={() => addToCart(item)} style={{ background: '#252525', borderRadius: '8px', border: '1px solid #333', padding: '0.5rem', cursor: 'pointer', textAlign: 'center', transition: '0.2s', borderLeft: '4px solid var(--accent-color)' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                        <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>{item.price.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <h3 style={{ margin: 0 }}>Savat</h3>
                                <input
                                    placeholder="Mijoz ismi (ixtiyoriy)"
                                    value={customerName} onChange={e => setCustomerName(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                                <input
                                    placeholder="Telefon raqami (ixtiyoriy)"
                                    value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                                <textarea
                                    placeholder="Buyurtma izohi (ixtiyoriy)"
                                    value={orderNote} onChange={e => setOrderNote(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', fontSize: '0.9rem', minHeight: '60px', resize: 'none' }}
                                />
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                                {cart.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: '#222', padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => updateQty(item.id, -1)} style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#333', border: 'none', color: '#fff', fontSize: '0.8rem' }}>-</button>
                                            <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                                            <button onClick={() => updateQty(item.id, 1)} style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#333', border: 'none', color: '#fff', fontSize: '0.8rem' }}>+</button>
                                            <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '0.5rem', color: '#ef4444', background: 'none', border: 'none' }}><FaTrash size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    <span>Jami:</span>
                                    <span>{cartTotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '0.8rem', background: '#333', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '0.9rem' }}>BEKOR</button>
                                    <button onClick={handlePlaceOrder} style={{ flex: 2, padding: '0.8rem', background: 'var(--success)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', fontSize: '0.9rem' }}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Modal for Saboy */}
                {showPaymentModal && selectedOrder && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PaymentModalContent
                            selectedTable={{
                                name: `SABOY: ${selectedOrder.customerName}`,
                                id: selectedOrder.id,
                                orders: [selectedOrder]
                            }}
                            initialServiceOff={true}
                            onClose={() => setShowPaymentModal(false)}
                            onCheckout={(method, extras) => {
                                // 1. Print
                                window.print();

                                // 2. Confirm then Close
                                setTimeout(() => {
                                    setPendingSaboyCheckout({ method, extras });
                                    setShowSaboyConfirmModal(true);
                                    setShowPaymentModal(false);
                                }, 100);
                            }}
                            settings={settings}
                            onError={(msg) => alert(msg)}
                        />
                    </div>
                )}

                {/* Print Portal for Saboy Receipt */}
                {selectedOrder && (
                    <PrintPortal>
                        <div className="print-receipt">
                            <h3>{settings.restaurantName || "LAZZAT KAFE"}</h3>
                            <p style={{ fontSize: '11px' }}>{settings.address || "Toshkent sh., Chilonzor tumani"}</p>
                            <p style={{ fontSize: '11px' }}>Tel: {settings.phone || "+998 90 123 45 67"}</p>
                            <hr />
                            <div className="receipt-header" style={{ textAlign: 'left', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>MIJOZ: <b>{selectedOrder.customerName || 'Saboy'}</b></span>
                                    <span>TEL: <b>{selectedOrder.phone || '...'}</b></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SANA: {new Date().toLocaleDateString()}</span>
                                    <span>VAQT: {new Date().toLocaleTimeString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>BUYURTMA: #<b>{selectedOrder.id.slice(-6).toUpperCase()}</b></span>
                                    <span>TUR: <b>SABOY</b></span>
                                </div>
                                <div>KASSIR: <b>{user?.username || "Kassir"}</b></div>
                            </div>
                            <p style={{ fontWeight: 'bold', margin: '5px 0' }}>SABOY CHEKI</p>
                            <hr />
                            <div style={{ padding: '0' }}>
                                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px', textAlign: 'left', color: '#000' }}>
                                    <thead>
                                        <tr style={{ background: '#f2f2f2' }}>
                                            <th style={{ border: '1px solid #000', width: '10%', padding: '2px', textAlign: 'center' }}>No</th>
                                            <th style={{ border: '1px solid #000', width: '35%', padding: '2px' }}>Nomi</th>
                                            <th style={{ border: '1px solid #000', width: '12%', textAlign: 'center', padding: '2px' }}>Soni</th>
                                            <th style={{ border: '1px solid #000', width: '18%', textAlign: 'right', padding: '2px' }}>Narxi</th>
                                            <th style={{ border: '1px solid #000', width: '25%', textAlign: 'right', padding: '2px' }}>Summa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, i) => (
                                            <tr key={i}>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{i + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'top', wordBreak: 'break-word' }}>{item.name}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right' }}>{Number(item.price).toLocaleString()}</td>
                                                <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <div style={{ padding: '0' }}>
                                <div className="receipt-total" style={{ fontSize: '16px' }}>
                                    <span>JAMI TO'LOV:</span>
                                    <span>{selectedOrder.total.toLocaleString()}</span>
                                </div>
                                <hr />
                                <div style={{ textAlign: 'left', fontSize: '13px', fontWeight: 'bold' }}>
                                    TO'LOV TURI: {pendingSaboyCheckout?.method || 'Naqd'}
                                </div>
                            </div>
                            <p style={{ textAlign: 'center', marginTop: '10px' }}>Xaridingiz uchun rahmat!</p>
                            <style>{`
                                .print-receipt {
                                    width: 80mm !important;
                                    margin: 0;
                                    background: white;
                                    color: #000000 !important;
                                    font-family: 'Courier New', monospace;
                                    padding: 2mm 3mm;
                                    box-sizing: border-box;
                                    text-align: center;
                                    font-size: 12px;
                                }
                                .print-receipt h3 { margin: 0; font-size: 18px; font-weight: bold; }
                                .print-receipt h2 { margin: 2px 0; font-size: 20px; font-weight: bold; }
                                .receipt-total { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
                                hr { border: none; border-top: 1px dashed #000 !important; margin: 5px 0; opacity: 1; }
                            `}</style>
                        </div>
                    </PrintPortal>
                )}

                {/* Saboy Confirmation Modal */}
                {showSaboyConfirmModal && pendingSaboyCheckout && selectedOrder && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}>
                        <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '30px', width: '450px', textAlign: 'center', border: '1px solid rgba(var(--success-rgb), 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--success)' }} />
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '900' }}>Tasdiqlash</h2>
                            <p style={{ color: '#ccc', marginBottom: '2.5rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
                                Chek chiqarildi.<br />
                                To'lov qabul qilindimi va buyurtma yopilsinmi?
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button onClick={() => { setShowSaboyConfirmModal(false); setPendingSaboyCheckout(null); }} style={{ flex: 1, padding: '1.2rem', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '15px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>QAYTISH</button>
                                <button
                                    onClick={() => {
                                        checkoutSaboyOrder(selectedOrder.id, pendingSaboyCheckout.method, pendingSaboyCheckout.extras);
                                        setShowSaboyConfirmModal(false);
                                        setPendingSaboyCheckout(null);
                                        setSelectedOrder(null);
                                    }}
                                    style={{ flex: 1, padding: '1.2rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(var(--success-rgb), 0.3)' }}
                                >
                                    HA, YOPILSIN
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 6.5 MESSAGES VIEW
    const MessagesView = () => {
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <FaEnvelope size={30} color="var(--accent-color)" />
                    <h2 style={{ margin: 0 }}>Mijozlar Xabarlari</h2>
                </div>

                {(!messages || messages.length === 0) ? (
                    <p style={{ color: '#666', textAlign: 'center', marginTop: '3rem' }}>Hozircha xabarlar yo'q.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                background: '#222', borderRadius: '12px', border: '1px solid #333',
                                padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                borderLeft: '4px solid var(--accent-color)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '0.8rem' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{msg.name}</h3>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                {msg.phone && (
                                    <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1rem' }}>
                                        рџ“ћ {msg.phone}
                                    </div>
                                )}
                                <div style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
                                    "{msg.message}"
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '1rem' }}>
                                    <button
                                        onClick={() => deleteMessage(msg.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)',
                                            padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                                            display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                    >
                                        <FaTrash /> O'chirish
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 6.6 WAITER APPLICATIONS VIEW
    const WaiterApplicationsView = () => {
        const { waiterApplications, approveWaiter, deleteWaiterApplication, openSuccess } = useData();
        const [showApproveModal, setShowApproveModal] = useState(false);
        const [selectedApp, setSelectedApp] = useState(null);
        const [authData, setAuthData] = useState({ username: '', password: '' });

        const handleApprove = (app) => {
            setSelectedApp(app);
            const suggestedUsername = app.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100);
            setAuthData({ username: suggestedUsername, password: '123' });
            setShowApproveModal(true);
        };

        const submitApproval = () => {
            if (!authData.username || !authData.password) return;
            approveWaiter({
                applicationId: selectedApp.id,
                username: authData.username,
                password: authData.password
            });
            setShowApproveModal(false);
            openSuccess("Ofitsiyant muvaffaqiyatli tasdiqlandi!");
        };

        return (
            <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <FaUsers size={30} color="var(--accent-color)" />
                    <h2 style={{ margin: 0 }}>Ofitsiyant Talabnomalari</h2>
                </div>

                {(!waiterApplications || waiterApplications.length === 0) ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666' }}>
                        <FaUsers size={60} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Hozircha yangi arizalar yo'q.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                        {waiterApplications.map(app => (
                            <div key={app.id} style={{
                                background: '#222', borderRadius: '15px', border: '1px solid #333',
                                padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                borderLeft: '5px solid var(--accent-color)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem' }}>{app.name}</h3>
                                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(app.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.2rem', background: 'rgba(255,215,0,0.05)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                                    рџ“ћ {app.phone}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => handleApprove(app)}
                                        style={{ flex: 1, padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                                    >
                                        TASDIQLASH
                                    </button>
                                    <button
                                        onClick={() => deleteWaiterApplication(app.id)}
                                        style={{ flex: 0.5, padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        RAD ETISH
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showApproveModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                        <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '24px', width: '450px', border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                            <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Tasdiqlash</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>{selectedApp?.name} uchun kirish ma'lumotlarini yarating:</p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Login (foydalanuvchi nomi)</label>
                                    <input
                                        value={authData.username}
                                        onChange={e => setAuthData({ ...authData, username: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', background: '#252525', border: '1px solid #444', color: '#fff', borderRadius: '12px', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: '#aaa', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Parol</label>
                                    <input
                                        type="text"
                                        value={authData.password}
                                        onChange={e => setAuthData({ ...authData, password: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', background: '#252525', border: '1px solid #444', color: '#fff', borderRadius: '12px', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button onClick={() => setShowApproveModal(false)} style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '12px' }}>BEKOR</button>
                                <button onClick={submitApproval} style={{ flex: 1, padding: '1rem', background: 'var(--accent-color)', border: 'none', color: '#000', fontWeight: '900', borderRadius: '12px' }}>TASDIQLASH</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
    };


    // --- LAYOUT ---
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>

            {/* Sidebar */}
            <div style={{ width: '250px', background: '#18181b', borderRight: '1px solid #333', padding: '1rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <h1 style={{ color: 'var(--accent-color)', marginBottom: '2rem', flexShrink: 0 }}>LAZZAT KAFE</h1>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {userRole === 'cashier' && (
                        <>
                            <button
                                onClick={() => setActiveTab('cashier')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'cashier' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaCashRegister /> Kassa
                            </button>
                            <button
                                onClick={() => setActiveTab('saboy')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'saboy' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaUtensils /> Saboy
                            </button>
                        </>
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
                                <FaChartLine /> Statistika
                            </button>
                            <button
                                onClick={() => setActiveTab('expenses')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'expenses' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaWallet /> Xarajatlar
                            </button>
                            <button
                                onClick={() => setActiveTab('employees')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'employees' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaUsers /> Xodimlar
                            </button>
                            <button
                                onClick={() => setActiveTab('settlements')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'settlements' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaWallet /> Oylik Hisob-Kitob
                            </button>
                        </>
                    )}
                    {userRole === 'admin' && ( // Admin Only
                        <>
                            <button
                                onClick={() => setActiveTab('archives')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'archives' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaHistory /> Arxiv (Z-Reports)
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'messages' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaEnvelope /> Xabarlar
                                {messages && messages.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent-color)', color: '#000', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem' }}>{messages.length}</span>}
                            </button>
                            <button
                                onClick={() => setActiveTab('waiter_apps')}
                                style={{
                                    padding: '1rem', textAlign: 'left', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center',
                                    background: activeTab === 'waiter_apps' ? '#333' : 'transparent', color: '#fff'
                                }}
                            >
                                <FaUsers /> Talabnomalar
                                {waiterApplications && waiterApplications.length > 0 && <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '50%', fontSize: '0.7rem' }}>{waiterApplications.length}</span>}
                            </button>
                        </>
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
                    onClick={logout}
                    style={{ marginTop: 'auto', padding: '1rem', background: '#333', color: '#fff', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}
                >
                    <FaSignOutAlt /> Chiqish
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeTab === 'cashier' && <CashierView />}
                {activeTab === 'saboy' && <SaboyView />}
                {activeTab === 'kitchen' && <KitchenView />}
                {activeTab === 'menu' && <MenuView />}
                {activeTab === 'categories' && <CategoriesView categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />}
                {activeTab === 'places' && <PlacesView />}
                {activeTab === 'stats' && <StatsView />}
                {activeTab === 'expenses' && <ExpensesView />}
                {activeTab === 'employees' && <EmployeesView />}
                {activeTab === 'history' && <HistoryView />}
                {activeTab === 'archives' && <ArchivesView />}
                {activeTab === 'settlements' && <SettlementView />}
                {activeTab === 'messages' && <MessagesView />}
                {activeTab === 'waiter_apps' && <WaiterApplicationsView />}
                {activeTab === 'settings' && <SettingsView settings={settings} updateSettings={updateSettings} clearAllStatistics={clearAllStatistics} openSuccess={openSuccess} />}
            </div>

            {/* NEW ORDER NOTIFICATION MODAL (CENTERED & MODERN) */}
            {showNewOrderNotification && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', padding: '3rem', borderRadius: '24px', width: '450px', maxWidth: '95%', textAlign: 'center', border: '1px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                            <FaUtensils size={40} />
                        </div>
                        <div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.5rem 0', fontWeight: '900' }}>Yangi Buyurtma!</h2>
                            <p style={{ color: '#ccc', fontSize: '1.1rem', margin: 0, lineHeight: 1.5 }}>
                                Ofitsiant tomonidan yangi buyurtma yuborildi.<br />
                                Iltimos, tasdiqlash uchun Oshxona bo'limiga o'ting.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                            <button onClick={() => setShowNewOrderNotification(false)} style={{ flex: 1, padding: '1rem', background: '#374151', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.2s' }}>
                                YOPISH
                            </button>
                            <button onClick={() => { setShowNewOrderNotification(false); setActiveTab('kitchen'); }} style={{ flex: 2, padding: '1rem', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)', transition: '0.2s' }}>
                                OSHXONAGA O'TISH
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes slideUpFade { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                    `}</style>
                </div>
            )}

            {/* GLOBAL ERROR MODAL */}
            {isAuthenticated && showErrorModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4500 }}>
                    <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', width: '350px', textAlign: 'center', border: '1px solid #ff4444', boxShadow: '0 10px 25px rgba(255, 68, 68, 0.2)' }}>
                        <div style={{ color: '#ff4444', marginBottom: '1rem' }}><FaTimes size={40} /></div>
                        <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>Xatolik</h2>
                        <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.2rem' }}>{errorMsg}</p>
                        <button onClick={() => setShowErrorModal(false)} style={{ padding: '0.8rem 2rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>OK</button>
                    </div>
                </div>
            )}

            {/* GLOBAL SUCCESS MODAL */}
            {showSuccessModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4500 }}>
                    <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', width: '350px', textAlign: 'center', border: '1px solid var(--success)', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ color: 'var(--success)', marginBottom: '1rem' }}><FaCheck size={40} /></div>
                        <h2 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Muvaffaqiyatli</h2>
                        <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.2rem' }}>{successMsg}</p>
                        <button onClick={() => setShowSuccessModal(false)} style={{ padding: '0.8rem 2rem', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', width: '100%' }}>OK</button>
                    </div>
                </div>
            )}

            {/* GENERIC CONFIRM MODAL */}
            {showGenericConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4500 }}>
                    <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', width: '400px', textAlign: 'center', border: '1px solid var(--accent-color)' }}>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>{confirmConfig.title}</h2>
                        <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1.1rem' }}>{confirmConfig.msg}</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowGenericConfirm(false)} style={{ flex: 1, padding: '1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>BEKOR</button>
                            <button onClick={() => { setShowGenericConfirm(false); confirmConfig.onConfirm(); }} style={{ flex: 1, padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>HA, TASDIQLASH</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASSWORD PROMPT MODAL (Z-REPORT) */}
            {showPasswordModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4500 }}>
                    <div style={{ background: '#1e1e1e', padding: '2.5rem', borderRadius: '16px', width: '400px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Tasdiqlash paroli</h2>
                        <p style={{ color: '#aaa', marginBottom: '2rem' }}>Kassani yopish uchun administrator parolini kiriting (8888)</p>
                        <input
                            autoFocus
                            type="password"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                            placeholder="****"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (passwordInput === '8888') {
                                        setShowPasswordModal(false);
                                        if (onPasswordSuccess) onPasswordSuccess();
                                    } else {
                                        alert("Parol noto'g'ri!");
                                    }
                                }
                            }}
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '5px', marginBottom: '1.5rem', outline: 'transparent' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: '1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>BEKOR</button>
                            <button onClick={() => {
                                if (passwordInput === '8888') {
                                    setShowPasswordModal(false);
                                    if (onPasswordSuccess) onPasswordSuccess();
                                } else {
                                    alert("Parol noto'g'ri!");
                                }
                            }} style={{ flex: 1, padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>TASDIQLASH</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DAILY REPORT PORTAL (Global for reliable printing) */}
            {showDailyReport && (
                <PrintPortal>
                    <div className="print-report" style={{ opacity: 1, visibility: 'visible', background: 'white', color: 'black' }}>
                        <h3>LAZZAT KAFE</h3>
                        <p style={{ fontWeight: '900', fontSize: '18px', margin: '2px 0' }}>Z-REPORT (YAKUN)</p>
                        <p style={{ fontSize: '12px', marginBottom: '5px' }}>{new Date().toLocaleString()}</p>
                        <hr style={{ borderTop: '2px dashed #000' }} />
                        
                        <div style={{ padding: '0 3mm' }}>
                            <table style={{ width: '100%', fontSize: '13px', fontWeight: 'bold', borderCollapse: 'collapse', border: '1px solid #000', textAlign: 'left', fontFamily: 'monospace' }}>
                                <tbody>
                                    <tr style={{ background: '#f2f2f2' }}>
                                        <td style={{ border: '1px solid #000', padding: '3px', width: '60%' }}>JAMI TUSHUM:</td>
                                        <td style={{ border: '1px solid #000', textAlign: 'right', padding: '3px', width: '40%' }}>{dailyStats.total.toLocaleString()}</td>
                                    </tr>
                                    <tr><td colSpan="2" style={{ border: '1px solid #000', padding: '5px', fontSize: '12px', background: '#eee' }}>TULOV TURLARI:</td></tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '3px', fontSize: '12px' }}>NAQD:</td>
                                        <td style={{ border: '1px solid #000', textAlign: 'right', padding: '3px' }}>{dailyStats.cash.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '3px', fontSize: '12px' }}>KARTA:</td>
                                        <td style={{ border: '1px solid #000', textAlign: 'right', padding: '3px' }}>{dailyStats.card.toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '3px', fontSize: '12px' }}>CLICK:</td>
                                        <td style={{ border: '1px solid #000', textAlign: 'right', padding: '3px' }}>{dailyStats.click.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <hr style={{ borderTop: '2px dashed #000', marginTop: '10px' }} />
                        <div style={{ padding: '0 3mm', fontSize: '13px', fontWeight: 'bold' }}>
                            Cheklar soni: {completedOrders.length} ta
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>KASSA YOPILDI</p>
                    </div>
                    <style>{`
                        @media print {
                            .print-report {
                                width: 80mm !important;
                                margin: 0;
                                padding: 2mm 0;
                                font-family: 'Courier New', monospace;
                                box-sizing: border-box !important;
                            }
                        }
                    `}</style>
                </PrintPortal>
            )}
        </div>
    );
};

export default AdminApp;
