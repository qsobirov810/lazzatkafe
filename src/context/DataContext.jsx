import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Connect to Backend
const socket = io('http://192.168.1.38:3000'); // Ensure this matches your server port

export const DataProvider = ({ children }) => {
    // --- STATE ---
    const [tables, setTables] = useState([]);
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [archives, setArchives] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // Connection Status
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Data Listeners
        socket.on('init_data', (data) => {
            console.log('Received init_data:', data);
            setTables(data.tables);
            setMenu(data.menu);
            if (data.categories) setCategories(data.categories);
            setActiveOrders(data.activeOrders);
            setCompletedOrders(data.history);
            setArchives(data.archives || []);
        });

        socket.on('data_update', (data) => {
            console.log('Received data_update:', data);
            setTables(data.tables);
            setMenu(data.menu);
            if (data.categories) setCategories(data.categories);
            setActiveOrders(data.activeOrders);
            setCompletedOrders(data.history);
            setArchives(data.archives || []);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('init_data');
            socket.off('data_update');
        };
    }, []);

    // --- ACTIONS ---

    // 1. Send Order (Waiter)
    const sendOrder = (tableId, items) => {
        if (items.length === 0) return;
        socket.emit('place_order', { tableId, items });
    };

    const updateOrder = (orderId, items) => {
        if (items.length === 0) return; // Or allow allow delete order? For now just prevent empty.
        socket.emit('update_order', { orderId, items });
    };

    // 2. Kitchen: Mark as Printed
    const markOrderPrinted = (orderId) => {
        socket.emit('mark_printed', orderId);
    };

    // 3. Cashier: Checkout Table
    const checkoutTable = (tableId, paymentMethod) => {
        socket.emit('checkout_table', { tableId, paymentMethod });
    };

    // 4. Admin: Update Menu
    const addMenuItem = (item) => socket.emit('add_menu_item', item);
    const updateMenuItem = (item) => socket.emit('update_menu_item', item);
    const deleteMenuItem = (itemId) => {
        if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
            socket.emit('delete_menu_item', itemId);
        }
    };

    // 5. Admin: Categories
    const addCategory = (name) => socket.emit('add_category', name);
    const deleteCategory = (id) => {
        if (window.confirm("Kategoriyani o'chirmoqchimisiz?")) {
            socket.emit('delete_category', id);
        }
    };

    // 6. Admin: Clear History
    // 5. Admin: Close Day
    const closeDay = (summary) => {
        socket.emit('close_day', summary);
    };

    const clearHistory = () => {
        socket.emit('clear_history');
    };

    return (
        <DataContext.Provider value={{
            tables, menu, categories, activeOrders, completedOrders, archives, isConnected,
            sendOrder, updateOrder, checkoutTable, markOrderPrinted, addMenuItem, updateMenuItem, deleteMenuItem,
            addCategory, deleteCategory, clearHistory, closeDay
        }}>
            {children}
        </DataContext.Provider>
    );
};
