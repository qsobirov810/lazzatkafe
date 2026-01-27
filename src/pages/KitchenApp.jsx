import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { FaPrint, FaClock, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const KitchenApp = () => {
    const { activeOrders, markOrderPrinted } = useData();
    const navigate = useNavigate();
    const [ticketToPrint, setTicketToPrint] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

    // Filter orders
    const displayedOrders = activeOrders.filter(order => {
        if (activeTab === 'active') return !order.printed;
        if (activeTab === 'history') return order.printed;
        return true;
    });

    const handlePrint = (order) => {
        markOrderPrinted(order.id);
        setTicketToPrint(order);
        // Allow React to render the ticket first, then print
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: '#333', padding: '0.5rem', borderRadius: '8px', color: '#fff' }}>Orqaga</button>
                    <h2>Oshxona (Buyurtmalar)</h2>
                </div>

                {/* Tabs */}
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
                        Tarix ({activeOrders.filter(o => o.printed).length})
                    </button>
                </div>
            </header>

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
                            <span style={{ color: '#aaa' }}>{new Date(order.timestamp).toLocaleTimeString()}</span>
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

            {/* --- PRINTABLE AREA (Hidden on Screen, Visible on Print) --- */}
            <div id="print-area">
                {ticketToPrint && (
                    <div className="ticket">
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
                                    <span className="qty">{item.quantity} x</span>
                                    <span className="name">{item.name}</span>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <p className="ticket-footer">--- ---------------- ---</p>
                    </div>
                )}
            </div>


            <style>{`
                /* Screen Styles for Print Area */
                #print-area {
                    display: none;
                }

                /* Print Styles */
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%; /* For 58mm/80mm printers */
                        display: block;
                        background: white;
                        color: black;
                    }
                    
                    .ticket {
                        width: 300px; /* Adjust for paper width (approx 80mm) */
                        padding: 10px;
                        font-family: 'Courier New', monospace;
                        text-align: center;
                    }
                    .ticket h3 { margin: 5px 0; font-size: 1.5rem; }
                    .ticket hr { border-top: 2px dashed #000; margin: 10px 0; }
                    .ticket-header { text-align: left; margin-bottom: 10px; }
                    .ticket-body { text-align: left; font-size: 1.2rem; font-weight: bold; }
                    .ticket-item { margin-bottom: 5px; display: flex; gap: 10px; }
                    .qty { min-width: 30px; }
                }
            `}</style>
        </div>
    );
};

export default KitchenApp;
