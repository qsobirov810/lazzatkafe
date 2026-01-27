const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
// Serve static images from the frontend public folder
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity (development)
        methods: ["GET", "POST"]
    }
});

// --- FILE UPLOAD (Multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to frontend public/images directory
        const uploadDir = path.join(__dirname, '../public/images');
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
    archives: []
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

        console.log("Database loaded.");
    } catch (e) {
        console.log("Error loading DB, using default.", e);
    }
} else {
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

    // 2. Place Order
    socket.on('place_order', ({ tableId, items }) => {
        const tableIndex = db.tables.findIndex(t => t.id === tableId);
        if (tableIndex === -1) return;

        const newOrder = {
            id: Date.now(),
            tableId,
            items,
            status: 'pending',
            printed: false,
            timestamp: new Date().toISOString(),
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
        const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update Active Order
        db.activeOrders[orderIndex] = {
            ...oldOrder,
            items,
            total: newTotal,
            // Keep printed status? Or reset? Usually reset if changed, but maybe keep for simplicity.
            // Let's keep printed status but Kitchen will see new items if they reprint.
            timestamp: new Date().toISOString() // Update time
        };

        // Update Order inside Table
        const tableIndex = db.tables.findIndex(t => t.id === oldOrder.tableId);
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
    socket.on('checkout_table', ({ tableId, paymentMethod }) => {
        const tableIndex = db.tables.findIndex(t => t.id === tableId);
        if (tableIndex === -1) return;

        const table = db.tables[tableIndex];
        if (table.orders.length === 0) return;

        // Move to History with Payment Info
        const closedOrders = table.orders.map(o => ({
            ...o,
            closedAt: new Date().toISOString(),
            paymentMethod: paymentMethod || 'Naqd'
        }));

        db.history.push(...closedOrders);

        // Reset Table
        db.tables[tableIndex] = {
            ...table,
            status: 'free',
            total: 0,
            orders: []
        };

        // Cleanup: Remove these orders from Active Orders list
        db.activeOrders = db.activeOrders.filter(o => o.tableId !== tableId);

        saveDb();

        saveDb();

        // Broadcast
        io.emit('data_update', db);
    });

    // 5. Menu Management
    socket.on('add_menu_item', (item) => {
        const newItem = { ...item, id: Date.now() }; // Simple ID generation
        db.menu.push(newItem);
        saveDb();
        io.emit('data_update', db);
    });

    socket.on('update_menu_item', (updatedItem) => {
        const index = db.menu.findIndex(i => i.id === updatedItem.id);
        if (index !== -1) {
            db.menu[index] = updatedItem;
            saveDb();
            io.emit('data_update', db);
        }
    });

    socket.on('delete_menu_item', (itemId) => {
        db.menu = db.menu.filter(i => i.id !== itemId);
        saveDb();
        io.emit('data_update', db);
    });

    // 7. Close Day (Archive)
    socket.on('close_day', (summary) => {
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

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
