import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Connect to Backend
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
const socket = io(API_URL);

export const DataProvider = ({ children }) => {
    // --- STATE ---
    const [tables, setTables] = useState([]);
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [reservations, setReservations] = useState([]); // New
    const [settings, setSettings] = useState({ servicePercentage: 0 }); // Settings
    const [archives, setArchives] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]); // New
    const [saboyOrders, setSaboyOrders] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(null);

    const login = async (password) => {
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (data.success) {
                // sessionStorage.setItem('adminToken', data.token); // REMOVED: Auto-logout on refresh
                setToken(data.token);
                socket.auth = { token: data.token };
                socket.disconnect().connect();
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server bilan bog\'lanishda xato' };
        }
    };

    const logout = () => {
        // sessionStorage.removeItem('adminToken');
        setToken(null);
        socket.auth = {};
        socket.disconnect().connect();
        setIsAuthenticated(false);
    };

    // REMOVED: checkAuth useEffect to enforce login on every refresh

    useEffect(() => {
        // Check initial state
        if (socket.connected) {
            setIsConnected(true);
            socket.emit('request_data');
        }

        // Connection Status
        socket.on('connect', () => {
            console.log("SOCKET CONNECTED:", socket.id);
            setIsConnected(true);
            socket.emit('request_data'); // Request data immediately on connect
        });
        socket.on('connect_error', (err) => {
            console.error("SOCKET CONNECTION ERROR:", err);
            setIsConnected(false);
        });
        socket.on('disconnect', () => {
            console.log("SOCKET DISCONNECTED");
            setIsConnected(false);
        });

        // Data Listeners
        socket.on('init_data', (data) => {
            console.log('Received init_data:', data);
            setTables(data.tables || []);
            setMenu(data.menu || []);
            setCategories(data.categories || []);
            setActiveOrders(data.activeOrders || []);
            setCompletedOrders(data.history || []);
            setArchives(data.archives || []);
            setReservations(data.reservations || []);
            setExpenses(data.expenses || []);
            setEmployees(data.employees || []);
            setAttendance(data.attendance || []);
            setSaboyOrders(data.saboyOrders || []);
            setSettings(data.settings || { servicePercentage: 0 });
        });

        socket.on('data_update', (data) => {
            console.log('Received data_update:', data);
            setTables(data.tables || []);
            setMenu(data.menu || []);
            setCategories(data.categories || []);
            setActiveOrders(data.activeOrders || []);
            setCompletedOrders(data.history || []);
            setArchives(data.archives || []);
            setReservations(data.reservations || []);
            setExpenses(data.expenses || []);
            setEmployees(data.employees || []);
            setAttendance(data.attendance || []);
            setSaboyOrders(data.saboyOrders || []);
            setSettings(data.settings || { servicePercentage: 0 });
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
    const sendOrder = (tableId, items, waiterName) => {
        if (items.length === 0) return;
        socket.emit('place_order', { tableId, items, waiterName });
    };

    const updateOrder = (orderId, items) => {
        // if (items.length === 0) return; // Allow empty items (voiding)
        socket.emit('update_order', { orderId, items });
    };

    // 2. Kitchen: Mark as Printed
    const markOrderPrinted = (orderId) => {
        socket.emit('mark_printed', orderId);
    };

    // 3. Cashier: Checkout Table
    const checkoutTable = (tableId, paymentMethod, extras = {}) => {
        socket.emit('checkout_table', { tableId, paymentMethod, ...extras });
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

    const clearKitchenHistory = (orderIds) => {
        socket.emit('clear_kitchen_history', orderIds);
    };

    const cancelOrder = (orderId) => {
        socket.emit('cancel_order', orderId);
    };

    // 7. Admin: Table Management
    const addTable = (name) => socket.emit('add_table', name);
    const deleteTable = (id) => {
        if (window.confirm("Stolni o'chirmoqchimisiz?")) {
            socket.emit('delete_table', id);
        }
    };

    // 8. Reservations (Banquet)
    const addReservation = (data) => socket.emit('add_reservation', data);
    const updateReservation = (data) => socket.emit('update_reservation', data);
    const deleteReservation = (id) => {
        if (window.confirm("Bronni bekor qilasizmi?")) {
            socket.emit('delete_reservation', id);
        }
    };
    const activateReservation = (id) => {
        if (window.confirm("Banketni boshlaysizmi? Stollar band qilinadi.")) {
            socket.emit('activate_reservation', id);
        }
    };

    // 9. Settings
    const updateSettings = (newSettings) => {
        socket.emit('update_settings', newSettings);
    };

    // 10. Expenses
    const addExpense = (data) => socket.emit('add_expense', data);
    const deleteExpense = (id) => {
        if (window.confirm("Xarajatni o'chirasizmi?")) {
            socket.emit('delete_expense', id);
        }
    };

    // 11. Employees
    const addEmployee = (data) => socket.emit('add_employee', data);
    const updateEmployee = (data) => socket.emit('update_employee', data);
    const deleteEmployee = (id) => {
        if (window.confirm("Xodimni o'chirasizmi?")) {
            socket.emit('delete_employee', id);
        }
    };

    // 12.1 Salary & Advance
    const addAdvance = (employeeId, amount, date, note) => {
        socket.emit('add_advance', { employeeId, amount, date, note });
    };

    const deleteAdvance = (employeeId, advanceId) => {
        if (window.confirm("Bo'nakni o'chirasizmi?")) {
            socket.emit('delete_advance', { employeeId, advanceId });
        }
    };

    const updateEmployeeSalary = (employeeId, salary) => {
        socket.emit('update_employee_salary', { employeeId, salary });
    };

    // 12.2 Attendance
    const logAttendance = (employeeId, type, note) => {
        socket.emit('log_attendance', { employeeId, type, note });
    };

    // 12. Saboy (Takeaway)
    const placeSaboyOrder = (items, customerName, phone, note) => {
        socket.emit('place_saboy_order', { items, customerName, phone, note });
    };

    const checkoutSaboyOrder = (orderId, paymentMethod, extras = {}) => {
        socket.emit('checkout_saboy_order', { orderId, paymentMethod, ...extras });
    };

    return (
        <DataContext.Provider value={{
            tables, menu, categories, activeOrders, completedOrders, archives, reservations, settings, expenses, employees, attendance, saboyOrders, isConnected, isAuthenticated, isLoading,
            sendOrder, updateOrder, checkoutTable, markOrderPrinted, addMenuItem, updateMenuItem, deleteMenuItem,
            addCategory, deleteCategory, clearHistory, closeDay, clearKitchenHistory, cancelOrder,
            addTable, deleteTable, addReservation, updateReservation, deleteReservation, activateReservation,
            updateSettings, addExpense, deleteExpense, addEmployee, updateEmployee, deleteEmployee,
            addAdvance, deleteAdvance, updateEmployeeSalary, logAttendance,
            placeSaboyOrder, checkoutSaboyOrder,
            login, logout
        }}>
            {children}
        </DataContext.Provider>
    );
};
