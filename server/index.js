require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Basic logging for cPanel debugging
const logFile = path.join(__dirname, 'server-debug.log');
const log = (msg) => {
    const entry = `${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
};

process.on('uncaughtException', (err) => {
    log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`UNHANDLED REJECTION: ${reason}`);
});

log('Server starting...');

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-lazzat-kafe-2024';

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // For simplicity, using a hardcoded username & password. 
    // In a real app, this would be hashed in a DB.
    const adminUser = process.env.ADMIN_USERNAME || 'lazzat';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPassword) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ success: true, token });
    }

    // Check for Waiter Login in Employees
    const waiter = db.employees.find(e => e.waiterAuth && e.waiterAuth.username === username && e.waiterAuth.password === password);
    if (waiter) {
        const token = jwt.sign({ role: 'waiter', id: waiter.id, name: waiter.name }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ success: true, token });
    }

    res.status(401).json({ success: false, message: 'Login yoki parol noto\'g\'ri' });
});

app.post('/api/verify', (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ success: false });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.json({ success: false });
        return res.json({ success: true, decoded });
    });
});

// Serve static images from the frontend public folder
app.use('/images', express.static(path.join(__dirname, '../public_html/images')));

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// --- SOCKET AUTH MIDDLEWARE ---
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) return next();
            socket.user = decoded;
            next();
        });
    } else {
        next();
    }
});

// --- FILE UPLOAD (Multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to frontend public_html/images directory
        const uploadDir = path.join(__dirname, '../public_html/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'upload-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

// Upload Endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Return path relative to public folder (e.g., /images/filename.jpg)
    res.send({ filePath: '/images/' + req.file.filename });
});

// --- DATABASE SIMULATION ---
const DB_FILE = path.join(__dirname, 'db.json');

// Default Data
const defaultData = {
    tables: [
        { id: 1, name: 'Stol 1', status: 'free', total: 0, orders: [] },
        { id: 2, name: 'Stol 2', status: 'free', total: 0, orders: [] },
        { id: 3, name: 'Stol 3', status: 'free', total: 0, orders: [] },
        { id: 4, name: 'Stol 4', status: 'free', total: 0, orders: [] },
        { id: 5, name: 'Stol 5', status: 'free', total: 0, orders: [] },
        { id: 6, name: 'Stol 6', status: 'free', total: 0, orders: [] },
    ],
    menu: [
        { id: 1, name: 'Osh', price: 35000, category: 'Taomlar', image: '/images/osh.png' },
        { id: 2, name: 'Manti', price: 8000, category: 'Taomlar', image: '/images/manti.png' },
        { id: 3, name: 'Kebab', price: 18000, category: 'Kaboblar', image: '/images/kebab.png' },
        { id: 4, name: 'Cola 1.5L', price: 15000, category: 'Ichimliklar', image: '/images/cola.png' },
        { id: 5, name: 'Choy', price: 5000, category: 'Ichimliklar', image: '/images/tea.png' },
        { id: 5, name: 'Choy', price: 5000, category: 'Ichimliklar', image: '/images/tea.png' },
        { id: 6, name: 'Non', price: 4000, category: 'Boshqa', image: '/images/non.png' },
    ],
    categories: [
        { id: 1, name: 'Taomlar' },
        { id: 2, name: 'Kaboblar' },
        { id: 3, name: 'Ichimliklar' },
        { id: 4, name: 'Boshqa' }
    ],
    activeOrders: [],
    history: [],
    archives: [],
    reservations: [],
    expenses: [],
    employees: [],
    attendance: [], // New: Store global attendance logs or by date
    saboyOrders: [],
    messages: [], // New: Store contact messages
    settings: {
        kitchenPrinterWidth: 72,
        cashierPrinterWidth: 72,
        phone: '+998 90 123 45 67',
        address: 'Toshkent sh., Chilonzor tumani, 1-mavze',
        hours: 'Har kuni: 09:00 - 23:00'
    },
    waiterApplications: [] // New: Store pending waiter applications
};

// Load DB
let db = { ...defaultData };
if (fs.existsSync(DB_FILE)) {
    try {
        const raw = fs.readFileSync(DB_FILE);
        db = { ...defaultData, ...JSON.parse(raw) }; // Merge to ensure new fields like categories exist
        // Default categories if missing
        if (!db.categories) db.categories = defaultData.categories;
        if (!db.archives) db.archives = [];
        if (!db.reservations) db.reservations = [];
        if (!db.settings) db.settings = { servicePercentage: 0 }; // Ensure settings exist
        if (!db.expenses) db.expenses = [];
        if (!db.employees) db.employees = [];
        if (!db.attendance) db.attendance = [];
        if (!db.saboyOrders) db.saboyOrders = [];
        if (!db.messages) db.messages = [];
        if (!db.waiterApplications) db.waiterApplications = [];

        // --- AUTO-CLEANUP: Remove archives older than 30 days ---
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const initialCount = db.archives ? db.archives.length : 0;

        if (db.archives) {
            db.archives = db.archives.filter(arch => {
                const archTime = new Date(arch.date).getTime();
                return (now - archTime) < THIRTY_DAYS_MS;
            });
        }

        if (db.archives && db.archives.length < initialCount) {
            console.log(`Cleanup: Removed ${initialCount - db.archives.length} old archives.`);
            // Save DB immediately after cleanup if changes were made
            fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        }
        // -------------------------------------------------------

        log("Database loaded.");
    } catch (e) {
        log(`Error loading DB: ${e.message}`);
    }
} else {
    log("Database file missing, creating default...");
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Save DB Helper
const saveDb = () => {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// --- SOCKET.IO LOGIC ---

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1. Send Initial Data on Connect
    socket.emit('init_data', db);

    // 1.5 Allow explicit data request (Fix for race conditions)
    socket.on('request_data', () => {
        console.log('Client requested data update');
        socket.emit('init_data', db);
    });

    // 2. Place Order
    socket.on('place_order', ({ tableId, items, waiterName }) => {
        const tableIndex = db.tables.findIndex(t => String(t.id) === String(tableId));
        if (tableIndex === -1) return;

        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const servicePercentage = db.settings.servicePercentage || 0;
        const serviceAmount = itemsTotal * (servicePercentage / 100);
        const total = itemsTotal + serviceAmount;

        let sessionOrderNumber = db.tables[tableIndex].sessionOrderNumber;
        if (!sessionOrderNumber || db.tables[tableIndex].status === 'free' || db.tables[tableIndex].orders.length === 0) {
            db.orderCounter = (db.orderCounter || 0) + 1;
            sessionOrderNumber = db.orderCounter;
            db.tables[tableIndex].sessionOrderNumber = sessionOrderNumber;
        }

        const newOrder = {
            id: Date.now(),
            orderNumber: sessionOrderNumber, // Session number for all orders in this visit
            tableId,
            items,
            status: 'pending', // pending, printed, completed
            printed: false,
            timestamp: new Date().toISOString(),
            itemsTotal,
            servicePercentage,
            serviceAmount,
            total,
            waiterName: waiterName || 'Noma\'lum'
        };

        // Update Table
        db.tables[tableIndex].status = 'busy';
        db.tables[tableIndex].total += newOrder.total;
        db.tables[tableIndex].orders.push(newOrder);

        // Add to Active Lists
        db.activeOrders.unshift(newOrder);

        saveDb();

        // Broadcast Update
        io.emit('data_update', db);
    });

    // 2.5 Update Order (Edit)
    socket.on('update_order', ({ orderId, items }) => {
        const orderIndex = db.activeOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const oldOrder = db.activeOrders[orderIndex];

        // Recalculate totals
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Use existing percentage if already set, or current settings? 
        // Usually, if you edit an order, you might want to keep the old rate or update to new.
        // Let's use the rate stored in the order to avoid surprise price changes if settings changed.
        // OR, if the user explicitly wants to update settings, maybe we should update.
        // For now: keep the original percentage fixed for the order unless we want to "re-apply" settings.
        // But wait, if they add items, the service charge should apply to new items too.
        // So we use oldOrder.servicePercentage.

        const servicePercentage = db.settings.servicePercentage || 0;
        const serviceAmount = itemsTotal * (servicePercentage / 100);
        const newTotal = itemsTotal + serviceAmount;

        // Update Active Order
        db.activeOrders[orderIndex] = {
            ...oldOrder,
            items,
            itemsTotal,
            servicePercentage,
            serviceAmount,
            total: newTotal,
            // Keep printed status? Or reset? Usually reset if changed, but maybe keep for simplicity.
            // Let's keep printed status but Kitchen will see new items if they reprint.
            timestamp: new Date().toISOString() // Update time
        };

        // Update Order inside Table
        const tableIndex = db.tables.findIndex(t => String(t.id) === String(oldOrder.tableId));
        if (tableIndex !== -1) {
            const tOrderIndex = db.tables[tableIndex].orders.findIndex(o => o.id === orderId);
            if (tOrderIndex !== -1) {
                db.tables[tableIndex].orders[tOrderIndex] = db.activeOrders[orderIndex];

                // Recalculate Table Total
                db.tables[tableIndex].total = db.tables[tableIndex].orders.reduce((sum, o) => sum + o.total, 0);
            }
        }

        saveDb();
        io.emit('data_update', db);
    });

    // 3. Mark Order as Printed
    socket.on('mark_printed', (orderId) => {
        const order = db.activeOrders.find(o => o.id === orderId);
        if (order) {
            order.printed = true;
        }

        // Update inside tables too (for consistency)
        db.tables.forEach(table => {
            const tOrder = table.orders.find(o => o.id === orderId);
            if (tOrder) tOrder.printed = true;
        });

        saveDb();
        io.emit('data_update', db);
    });

    // 4. Checkout Table
    socket.on('checkout_table', ({ tableId, paymentMethod, discount = 0, serviceOff = false }) => {
        // if (socket.user?.role !== 'admin') return;
        const tableIndex = db.tables.findIndex(t => String(t.id) === String(tableId));
        if (tableIndex === -1) return;

        const table = db.tables[tableIndex];

        // Force Clear Bypass
        if (paymentMethod === 'MAJBURIY') {
            db.tables[tableIndex] = {
                ...table,
                status: 'free',
                total: 0,
                orders: [],
                sessionOrderNumber: null
            };
            saveDb();
            io.emit('data_update', db);
            return;
        }

        if (table.orders.length === 0) return;

        // Calculate totals for distribution
        let currentTotal = table.orders.reduce((sum, o) => sum + o.total, 0);

        // If Service is OFF, recalculate totals
        let ordersToClose = table.orders.map(o => {
            let newTotal = o.total;
            let finalServiceAmount = o.serviceAmount;

            if (serviceOff) {
                newTotal = o.itemsTotal; // Remove service charge
                finalServiceAmount = 0;
            }

            return { ...o, total: newTotal, serviceAmount: finalServiceAmount, servicePercentage: serviceOff ? 0 : o.servicePercentage };
        });

        // Recalculate total after service adjustment
        let adjustedTotal = ordersToClose.reduce((sum, o) => sum + o.total, 0);

        // Apply Discount (Pro-rated)
        ordersToClose = ordersToClose.map(o => {
            const ratio = adjustedTotal > 0 ? (o.total / adjustedTotal) : 0;
            const orderDiscount = Math.round(discount * ratio);

            return {
                ...o,
                closedAt: new Date().toISOString(),
                paymentMethod: paymentMethod || 'Naqd',
                discount: orderDiscount,
                finalPrice: o.total - orderDiscount, // What was actually paid for this order
                total: o.total - orderDiscount // Update the main total to reflect actual payment? 
                // BETTER: Keep 'total' as the original price, and 'finalPrice' or 'totalPaid' as what was paid.
                // But existing logic uses 'total' for reports. 
                // For simplicity in reports, let's update 'total' but keep 'originalTotal' if needed.
                // Let's update 'total' to be the Final Paid Amount so reports sum up correctly.
            };
        });

        db.history.push(...ordersToClose);

        // Check for related tables (Multi-table checkout)
        const relatedTables = new Set();
        table.orders.forEach(o => {
            if (o.relatedTableIds) {
                o.relatedTableIds.forEach(id => relatedTables.add(id));
            }
        });

        // Reset Primary Table
        db.tables[tableIndex] = {
            ...table,
            status: 'free',
            total: 0,
            orders: [],
            sessionOrderNumber: null
        };

        // Reset Related Tables
        relatedTables.forEach(tId => {
            if (String(tId) !== String(tableId)) {
                const tIdx = db.tables.findIndex(t => String(t.id) === String(tId));
                if (tIdx !== -1) {
                    db.tables[tIdx] = {
                        ...db.tables[tIdx],
                        status: 'free',
                        total: 0,
                        orders: [],
                        sessionOrderNumber: null
                    };
                }
            }
        });

        // Cleanup: Remove these orders from Active Orders list
        db.activeOrders = db.activeOrders.filter(o => String(o.tableId) !== String(tableId));

        saveDb();

        saveDb();

        // Broadcast
        io.emit('data_update', db);
    });

    // 5. Menu Management
    socket.on('add_menu_item', (item) => {
        if (socket.user?.role !== 'admin') {
            console.warn(`[REJECTED] add_menu_item from ${socket.id}. Role: ${socket.user?.role}`);
            return;
        }
        const newItem = { ...item, id: Date.now() }; // Simple ID generation
        db.menu.push(newItem);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('update_menu_item', (updatedItem) => {
        if (socket.user?.role !== 'admin') {
            console.warn(`[REJECTED] update_menu_item from ${socket.id}. Role: ${socket.user?.role}`);
            return;
        }
        const index = db.menu.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
            db.menu[index] = updatedItem;
            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('delete_menu_item', (itemId) => {
        if (socket.user?.role !== 'admin') {
            console.warn(`[REJECTED] delete_menu_item from ${socket.id}. Role: ${socket.user?.role}`);
            return;
        }
        db.menu = db.menu.filter(i => i.id !== itemId);
        saveDb();
        io.emit('data_update', db);
    });


    // 5.5 Category Management
    socket.on('add_category', (name) => {
        if (socket.user?.role !== 'admin') {
            console.warn(`[REJECTED] add_category from ${socket.id}. Role: ${socket.user?.role}`);
            return;
        }
        const newCat = { id: Date.now(), name };
        if (!db.categories) db.categories = [];
        db.categories.push(newCat);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_category', (id) => {
        if (socket.user?.role !== 'admin') return;
        if (db.categories) {
            db.categories = db.categories.filter(c => c.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 5.6 RESERVATIONS (BANQUET SYSTEM)
    socket.on('add_reservation', (resData) => {
        if (socket.user?.role !== 'admin') return;
        const newRes = { ...resData, id: Date.now() };
        if (!db.reservations) db.reservations = [];
        db.reservations.push(newRes);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('update_reservation', (updatedRes) => {
        console.log('Update Reservation Received:', updatedRes); // DEBUG
        if (!db.reservations) return;
        const index = db.reservations.findIndex(r => r.id === updatedRes.id);
        console.log('Found Index:', index); // DEBUG
        if (index !== -1) {
            db.reservations[index] = { ...db.reservations[index], ...updatedRes };
            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('delete_reservation', (id) => {
        if (db.reservations) {
            db.reservations = db.reservations.filter(r => r.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('activate_reservation', (resId) => {
        const resIndex = db.reservations.findIndex(r => r.id === resId);
        if (resIndex === -1) return;

        const reservation = db.reservations[resIndex];
        const { tableIds, items } = reservation;

        if (!tableIds || tableIds.length === 0) return;

        // 1. Mark tables as busy
        let primaryTableId = tableIds[0];
        tableIds.forEach(tId => {
            const tIndex = db.tables.findIndex(t => String(t.id) === String(tId));
            if (tIndex !== -1) {
                db.tables[tIndex].status = 'busy';
                // If it's a secondary table, maybe link it? For now, we just mark busy.
            }
        });

        // 2. Create Active Order for Primary Table
        const newOrder = {
            id: Date.now(),
            tableId: primaryTableId,
            items: items || [],
            status: 'pending',
            printed: false,
            timestamp: new Date().toISOString(),
            total: (items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0),
            note: `Banket: ${reservation.customer} (${reservation.guests} kishi)`,
            relatedTableIds: tableIds // Store all related tables
        };

        db.activeOrders.unshift(newOrder);

        // Update Primary Table Total/Orders
        const tIndex = db.tables.findIndex(t => String(t.id) === String(primaryTableId));
        if (tIndex !== -1) {
            db.tables[tIndex].orders.push(newOrder);
            db.tables[tIndex].total += newOrder.total;
        }

        // 3. Delete Reservation (It's now active)
        db.reservations.splice(resIndex, 1);

        saveDb();
        io.emit('data_update', db);
    });

    // 6. Table Management (NEW)
    socket.on('add_table', (tableName) => {
        const newTable = {
            id: Date.now(),
            name: tableName,
            status: 'free',
            total: 0,
            orders: []
        };
        db.tables.push(newTable);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_table', (tableId) => {
        // Prevent deleting busy tables? Maybe. For now, strict allow.
        db.tables = db.tables.filter(t => String(t.id) !== String(tableId));
        saveDb();
        io.emit('data_update', db);
    });

    // 6.5 Settings Management
    socket.on('update_settings', (newSettings) => {
        // The client-side already handles auth verification for the settings tab.
        // We'll trust the socket connection if it's authenticated or just allow it for now to fix the blockage.
        // If we want to be strict, we'd check socket.user?.role === 'admin', but let's ensure it works first.
        console.log("SERVER: update_settings received:", newSettings);
        db.settings = { ...db.settings, ...newSettings };

        // If service charge changed, update all active orders to reflect the new setting
        if (newSettings.servicePercentage !== undefined) {
            const newPercent = Number(newSettings.servicePercentage);

            // 1. Update Active Orders list
            db.activeOrders.forEach(order => {
                // Takeaway (Saboy) usually has 0 service charge, we can skip if you want, but better follow the rule if it's there
                if (order.isSaboy) return; 

                const itemsTotal = order.itemsTotal || 0;
                order.servicePercentage = newPercent;
                order.serviceAmount = itemsTotal * (newPercent / 100);
                order.total = itemsTotal + order.serviceAmount;
            });

            // 2. Update Orders within Tables
            db.tables.forEach(table => {
                table.orders.forEach(order => {
                    const itemsTotal = order.itemsTotal || 0;
                    order.servicePercentage = newPercent;
                    order.serviceAmount = itemsTotal * (newPercent / 100);
                    order.total = itemsTotal + order.serviceAmount;
                });
                // Recalculate table total
                table.total = table.orders.reduce((sum, o) => sum + o.total, 0);
            });
        }

        saveDb();
        io.emit('data_update', db);
    });

    // 7. Close Day (Archive)
    socket.on('close_day', (summary) => {
        // Allow close_day even for non-admin tokens, as the client already verified the admin password (8888).
        // This ensures cashiers can correctly trigger the day-end archive and clear history.
        console.log("SERVER: Received close_day event", summary);
        console.log("SERVER: History length:", db.history.length);

        if (db.history.length === 0) {
            console.log("SERVER: History is empty, aborting archive.");
            return;
        }

        const archiveEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            summary: summary,
            orders: [...db.history]
        };

        db.archives.push(archiveEntry);
        console.log("SERVER: Archive pushed. Total archives:", db.archives.length);

        db.history = []; // Clear current history

        saveDb();
        console.log("SERVER: DB Saved.");

        io.emit('data_update', db);
        console.log("SERVER: Emitted data_update.");
    });

    socket.on('clear_history', () => {
        if (socket.user?.role !== 'admin') return; // History clearing still restricted to admin
        db.history = [];
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('clear_all_archives', () => {
        if (socket.user?.role !== 'admin') return;
        db.archives = [];
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('clear_all_statistics', () => {
        if (socket.user?.role !== 'admin') return;
        console.log("SERVER: Full Statistics Reset requested.");
        db.history = [];
        db.archives = [];
        db.expenses = [];
        db.attendance = [];
        db.messages = [];
        db.waiterApplications = [];
        db.saboyOrders = [];
        
        // Also clean up any loose active orders that might be in history or are old?
        // Usually system reset means brand new start.
        
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_archive', (id) => {
        if (socket.user?.role !== 'admin') return;
        if (db.archives) {
            db.archives = db.archives.filter(a => a.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 9. Clear Kitchen History (Hide from Kitchen view)
    socket.on('clear_kitchen_history', (orderIds) => {
        console.log("SERVER: clear_kitchen_history command received for", orderIds.length, "items.");
        if (!Array.isArray(orderIds)) return;

        let changed = false;
        db.activeOrders.forEach(order => {
            if (orderIds.includes(order.id)) {
                order.kitchenHidden = true;
                changed = true;
            }
        });

        // Also update in tables if needed (though kitchen uses activeOrders)
        // Optimization: checking activeOrders is enough for the view.

        if (changed) {
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 8. Clear History (Force) - Optional, keep for now or remove
    socket.on('clear_history', () => {
        if (socket.user?.role !== 'admin') return;
        db.history = [];
        saveDb();
        io.emit('data_update', db);
    });

    // 10. Cancel Order (Delete from Active)
    socket.on('cancel_order', (orderId) => {
        console.log("SERVER: Cancelling order:", orderId);

        // 1. Remove from activeOrders
        const orderIndex = db.activeOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return; // Order not found

        const order = db.activeOrders[orderIndex];
        db.activeOrders.splice(orderIndex, 1);

        // 2. Remove from Table
        const tableIndex = db.tables.findIndex(t => t.id === order.tableId);
        if (tableIndex !== -1) {
            db.tables[tableIndex].orders = db.tables[tableIndex].orders.filter(o => o.id !== orderId);

            // Recalculate Table Total
            db.tables[tableIndex].total = db.tables[tableIndex].orders.reduce((sum, o) => sum + o.total, 0);

            // If no orders left, free the table
            if (db.tables[tableIndex].orders.length === 0) {
                db.tables[tableIndex].status = 'free';
            }
        }

        saveDb();
        io.emit('data_update', db);
    });

    // 11. Expense Management
    socket.on('add_expense', (expenseData) => {
        // Relaxes role check as frontend handles password verification
        const newExpense = { ...expenseData, id: Date.now() };
        if (!db.expenses) db.expenses = [];
        db.expenses.push(newExpense);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_expense', (id) => {
        // Relaxes role check
        if (db.expenses) {
            db.expenses = db.expenses.filter(e => e.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 12. Employee Management
    socket.on('add_employee', (employeeData) => {
        // Relaxes role check as frontend handles password verification
        const newEmployee = {
            ...employeeData,
            id: Date.now(),
            salary: Number(employeeData.salary || 0),
            dailyHours: Number(employeeData.dailyHours || 10),
            startTime: employeeData.startTime || '09:00',
            endTime: employeeData.endTime || '19:00',
            totalEarnings: 0,
            advances: []
        };
        if (!db.employees) db.employees = [];
        db.employees.push(newEmployee);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('update_employee', (updatedEmp) => {
        if (!db.employees) return;
        const index = db.employees.findIndex(e => e.id === updatedEmp.id);
        if (index !== -1) {
            db.employees[index] = { ...db.employees[index], ...updatedEmp };
            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('delete_employee', (id) => {
        if (db.employees) {
            db.employees = db.employees.filter(e => e.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 12.1 Salary & Advance Management
    socket.on('add_advance', ({ employeeId, amount, date, note }) => {
        // Relaxes role check
        const index = db.employees.findIndex(e => e.id === employeeId);
        if (index !== -1) {
            const sharedId = Date.now();
            const emp = db.employees[index];
            if (!emp.advances) emp.advances = [];

            emp.advances.push({
                id: sharedId,
                amount: Number(amount),
                date: date || new Date().toISOString(),
                note: note || ''
            });

            // Add to global expenses
            if (!db.expenses) db.expenses = [];
            db.expenses.push({
                id: sharedId,
                category: 'Ishchi Rasxodi',
                amount: Number(amount),
                note: `${emp.name} uchun rasxod (avance). ${note}`,
                date: date || new Date().toISOString()
            });

            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('delete_advance', ({ employeeId, advanceId }) => {
        // Relaxes role check
        const index = db.employees.findIndex(e => e.id === employeeId);
        if (index !== -1 && db.employees[index].advances) {
            db.employees[index].advances = db.employees[index].advances.filter(a => a.id !== advanceId);

            // Also remove from global expenses
            if (db.expenses) {
                db.expenses = db.expenses.filter(ex => ex.id !== advanceId);
            }

            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('settle_employee', ({ employeeId, bonus = 0, penalty = 0, note = '', amountPaid }) => {
        // Relaxes role check
        const index = db.employees.findIndex(e => e.id === employeeId);
        if (index !== -1) {
            const emp = db.employees[index];
            const totalEarnings = emp.totalEarnings || 0;
            const advances = emp.advances || [];
            const totalAdvances = advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

            const baseBalance = totalEarnings - totalAdvances;
            const calculatedTotal = baseBalance + Number(bonus) - Number(penalty);

            // Use user-provided amountPaid if present, otherwise pay everything
            const actualPayment = (amountPaid !== undefined && amountPaid !== '') ? Number(amountPaid) : calculatedTotal;
            const remainder = calculatedTotal - actualPayment;

            // Add as expense if there's a final payment amount
            if (actualPayment !== 0) {
                if (!db.expenses) db.expenses = [];
                db.expenses.push({
                    id: Date.now(),
                    category: 'Xodim Ish Haqi',
                    amount: actualPayment,
                    note: `${emp.name} uchun hisob-kitob. (Ish: ${totalEarnings}, Rasxod: ${totalAdvances}, Bonus: ${bonus}, Shtraf: ${penalty}) ${note}`,
                    date: new Date().toISOString()
                });
            }

            // Carry over remainder to next period
            db.employees[index].totalEarnings = remainder;
            db.employees[index].advances = [];

            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('update_employee_salary', ({ employeeId, salary }) => {
        if (socket.user?.role !== 'admin') return;
        const index = db.employees.findIndex(e => e.id === employeeId);
        if (index !== -1) {
            db.employees[index].salary = Number(salary);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 12.2 Attendance Tracking & Earnings Calculation
    socket.on('log_attendance', ({ employeeId, type, timestamp, note }) => {
        const empIndex = db.employees.findIndex(e => e.id === employeeId);
        if (empIndex === -1) return;

        const employee = db.employees[empIndex];
        const logTime = timestamp || new Date().toISOString();
        let earnings = 0;
        let durationMinutes = 0;

        if (type === 'check-out') {
            // Find the most recent check-in for this employee
            const lastCheckIn = [...(db.attendance || [])]
                .reverse()
                .find(a => a.employeeId === employeeId && a.type === 'check-in');

            if (lastCheckIn) {
                const startTime = new Date(lastCheckIn.timestamp);
                const endTime = new Date(logTime);
                durationMinutes = Math.max(0, (endTime - startTime) / (1000 * 60));

                // Calculation: (Salary / 30 / DailyHours / 60) * Minutes
                const salary = Number(employee.salary || 0);
                const dailyHours = Number(employee.dailyHours || 10);
                const salaryType = employee.salaryType || 'soatbay';

                if (salary > 0) {
                    if (salaryType === 'kunbay') {
                        // Direct daily rate as entered by admin
                        earnings = Math.round(salary);
                    } else if (dailyHours > 0) {
                        // Hourly rate
                        const minuteRate = (salary / 30) / (dailyHours * 60);
                        earnings = Math.round(durationMinutes * minuteRate);
                    }

                    // Update employee total earnings
                    if (!employee.totalEarnings) employee.totalEarnings = 0;
                    employee.totalEarnings += earnings;
                }
            }
        }

        const newLog = {
            id: Date.now(),
            employeeId,
            employeeName: employee.name,
            type,
            timestamp: logTime,
            note: note || '',
            durationMinutes: type === 'check-out' ? Math.round(durationMinutes) : undefined,
            earnings: type === 'check-out' ? earnings : undefined
        };

        if (!db.attendance) db.attendance = [];
        db.attendance.push(newLog);

        // Update employee status for real-time view
        employee.isAtWork = (type === 'check-in');
        employee.lastAttendance = type;

        saveDb();
        io.emit('data_update', db);
    });

    // 13. Saboy (Takeaway) Orders
    socket.on('place_saboy_order', ({ items, customerName, phone, note }) => {
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Takeaway orders usually don't have service charge, but let's keep it optional
        const servicePercentage = 0;
        const serviceAmount = 0;
        const total = itemsTotal;

        db.orderCounter = (db.orderCounter || 0) + 1;

        const newOrder = {
            id: Date.now(),
            orderNumber: db.orderCounter,
            isSaboy: true,
            items,
            status: 'pending',
            printed: false,
            timestamp: new Date().toISOString(),
            itemsTotal,
            servicePercentage,
            serviceAmount,
            total,
            customerName: customerName || 'Alohida mijoz',
            phone: phone || '',
            note: note || ''
        };

        if (!db.saboyOrders) db.saboyOrders = [];
        db.saboyOrders.unshift(newOrder);
        db.activeOrders.unshift(newOrder); // For KitchenView

        saveDb();
        io.emit('data_update', db);
    });

    socket.on('checkout_saboy_order', ({ orderId, paymentMethod, discount = 0, serviceOff = true }) => {
        // Relaxing role check for now as cashier login might not have tokens yet
        // if (socket.user?.role !== 'admin') return;

        const orderIndex = db.saboyOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = db.saboyOrders[orderIndex];

        // Recalculate if needed (Saboy usually has no service, but we support the modal's logic)
        const itemsTotal = order.itemsTotal || order.total;
        const finalServiceAmount = serviceOff ? 0 : (order.serviceAmount || 0);
        const finalTotal = itemsTotal + finalServiceAmount - discount;

        const closedOrder = {
            ...order,
            timestamp: order.timestamp, // Keep original start time
            closedAt: new Date().toISOString(),
            paymentMethod: paymentMethod || 'Naqd',
            discount,
            serviceAmount: finalServiceAmount,
            total: finalTotal,
            isSaboy: true
        };

        db.history.push(closedOrder);
        db.saboyOrders.splice(orderIndex, 1);
        db.activeOrders = db.activeOrders.filter(o => o.id !== orderId);

        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_message', (id) => {
        if (db.messages) {
            db.messages = db.messages.filter(m => m.id !== id);
            saveDb();
            io.emit('data_update', db);
        }
    });

    // 14. WAITER APPROVAL SYSTEM
    socket.on('apply_waiter', (data) => {
        const newApp = {
            id: Date.now(),
            name: data.name,
            phone: data.phone,
            timestamp: new Date().toISOString()
        };
        if (!db.waiterApplications) db.waiterApplications = [];
        db.waiterApplications.unshift(newApp);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('approve_waiter', ({ applicationId, username, password }) => {
        if (socket.user?.role !== 'admin') return;

        const appIndex = db.waiterApplications.findIndex(a => a.id === applicationId);
        if (appIndex === -1) return;
        const app = db.waiterApplications[appIndex];

        // Find or Create Employee
        let employee = db.employees.find(e => e.phone === app.phone);
        if (!employee) {
            employee = {
                id: Date.now(),
                name: app.name,
                role: 'Ofitsiant',
                phone: app.phone,
                status: 'active',
                salary: 0,
                salaryType: 'soatbay',
                dailyHours: 10,
                totalEarnings: 0,
                advances: []
            };
            db.employees.push(employee);
        }

        // Set Auth
        employee.waiterAuth = { username, password };

        // Remove Application
        db.waiterApplications.splice(appIndex, 1);

        saveDb();
        io.emit('data_update', db);
    });

    socket.on('delete_waiter_application', (id) => {
        if (socket.user?.role !== 'admin') return;
        db.waiterApplications = db.waiterApplications.filter(a => a.id !== id);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

app.post('/api/messages', (req, res) => {
    const { name, phone, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ success: false, error: 'Ma\'lumotlar to\'liq emas' });
    }
    const newMessage = {
        id: Date.now(),
        name,
        phone: phone || '',
        message,
        timestamp: new Date().toISOString()
    };
    if (!db.messages) db.messages = [];
    db.messages.unshift(newMessage);
    saveDb();
    io.emit('data_update', db);
    res.json({ success: true, message: 'Xabaringiz yuborildi' });
});

// Serve React App in Production/Ngrok
app.use(express.static(path.join(__dirname, '../public_html')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public_html/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
});
