/**
 * API-Pick-up/server.js
 * Express server configuration with MySQL connection.
 * Handles API endpoints for fetching order data and authentication.
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(cors({
    origin: [
        'http://localhost:4000', 
        'http://localhost:4003',
        'http://192.168.0.8:4000', 
        'http://192.168.0.8:4001',
        'http://192.168.0.8:4002',
        'http://192.168.0.8:4003',
        'http://192.168.0.8:4004',
        'http://192.168.0.8:4005',
        'http://192.168.0.8:4006',
        'http://192.168.0.8:4007',
        'http://192.168.0.8:4008',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    credentials: true
}));

app.use(express.json());

// MySQL Database Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aliz',
    database: 'pickup'
});

// Initialize Database Connection
db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL Database: "pickup"');
});

/**
 * API Routes
 */

// 1. GET ALL ORDERS (Admin view)
app.get('/api/v1/orders', (req, res) => {
    const query = `
        SELECT 
            o.order_id AS id, 
            DATE_FORMAT(o.order_date, '%d/%m/%Y') AS date,
            o.state AS status, 
            o.total, 
            o.pickup_code,
            s.name AS store
        FROM \`order\` o
        JOIN store s ON o.store_id = s.store_id
        ORDER BY o.order_id DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('SQL Execution Error:', err);
            return res.status(500).send('Server Error');
        }
        res.json(results);
    });
});

// 2. GET ORDERS BY STORE (Employee view)
app.get('/api/v1/orders/store/:storeId', (req, res) => {
    const storeId = req.params.storeId;

    const query = `
        SELECT 
            o.order_id AS id, 
            DATE_FORMAT(o.order_date, '%d/%m/%Y') AS date,
            o.state AS status, 
            o.total, 
            o.pickup_code,
            s.name AS store
        FROM \`order\` o
        JOIN store s ON o.store_id = s.store_id
        WHERE o.store_id = ? 
        ORDER BY o.order_id DESC
    `;

    db.query(query, [storeId], (err, results) => {
        if (err) {
            console.error('SQL Execution Error:', err);
            return res.status(500).send('Server Error');
        }
        res.json(results);
    });
});

// 3. REGISTER CUSTOMER
// Inserts a new customer into the database.
app.post('/api/v1/register', (req, res) => {
    const { name, phone, email, address, password} = req.body;
    const query = `INSERT INTO client (name, phone, email, address, password) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [name, phone, email, address, password], (err, result) => {
        if (err) {
            console.error('SQL Register Error:', err);
            return res.status(500).json({ error: 'Database error during registration' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
});

// 4. LOGIN CUSTOMER
app.post('/api/v1/login', (req, res) => {
    const { email, password } = req.body;

    const query = `
        SELECT client_id AS id, name, email 
        FROM client 
        WHERE email = ? AND password = ?
    `;

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('SQL Login Error:', err);
            return res.status(500).json({ error: 'Database error during login' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Simulación de token (puedes cambiarlo después)
        const token = `token-${results[0].id}-${Date.now()}`;

        res.json({
            message: "Login successful",
            client: {
                id: results[0].id,
                name: results[0].name,
                email: results[0].email,
                token
            }
        });
    });
});
// GET ALL STORES
app.get('/api/v1/store', (req, res) => {
    const query = `
        SELECT 
            store_id,
            name,
            address,
            phone,
            schedule
        FROM store
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('SQL Store Error:', err);
            return res.status(500).json({ error: 'Database error fetching stores' });
        }
        res.json(results);
    });
});

// GET PRODUCTS BY STORE ID
app.get('/api/v1/product/store/:storeId', (req, res) => {
    const storeId = req.params.storeId;

    const query = `
        SELECT 
            product_id,
            name,
            description,
            price,
            store_id
        FROM product
        WHERE store_id = ?
    `;

    db.query(query, [storeId], (err, results) => {
        if (err) {
            console.error('SQL Product Error:', err);
            return res.status(500).json({ error: 'Database error fetching products' });
        }
        res.json(results);
    });
});
// GET SINGLE PRODUCT
app.get('/api/v1/product/:productId', (req, res) => {
    const productId = req.params.productId;

    const query = `
        SELECT 
            product_id,
            name,
            description,
            price,
            store_id
        FROM product
        WHERE product_id = ?
    `;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('SQL Single Product Error:', err);
            return res.status(500).json({ error: 'Database error fetching product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(results[0]);
    });
});
// GET SINGLE STORE
app.get('/api/v1/store/:id', (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT 
            store_id,
            name,
            address,
            phone,
            schedule
        FROM store
        WHERE store_id = ?
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('SQL Store ID Error:', err);
            return res.status(500).json({ error: 'Database error fetching store' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json(results[0]);
    });
});
// GET PRODUCTS BY STORE ID
app.get('/api/v1/product/store/:storeId', (req, res) => {
    const storeId = req.params.storeId;

    const query = `
        SELECT 
            product_id,
            name,
            description,
            price,
            store_id
        FROM product
        WHERE store_id = ?
    `;

    db.query(query, [storeId], (err, results) => {
        if (err) {
            console.error('SQL Product Error:', err);
            return res.status(500).json({ error: 'Database error fetching products' });
        }
        res.json(results);
    });
});

// CREATE ORDER
// CREATE ORDER
app.post('/api/v1/order', (req, res) => {
    const { client_id, store_id, total, items } = req.body;

    if (!client_id || !store_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Generar código de recogida
    const pickup_code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1️⃣ Insertar la orden
    const orderQuery = `
        INSERT INTO \`order\`
            (client_id, store_id, total, pickup_code)
        VALUES (?, ?, ?, ?)
    `;

    db.query(orderQuery, [client_id, store_id, total, pickup_code], (err, orderResult) => {
        if (err) {
            console.error("❌ SQL Order Error:", err);
            return res.status(500).json({ error: "Database error saving order" });
        }

        const orderId = orderResult.insertId; // ID de la orden creada

        // 2️⃣ Insertar detalles
        const values = items.map(item => [
            item.qty,        // quantity
            item.price,      // sale_price
            orderId,         // order_id
            item.product_id  // product_id
        ]);

        const detailQuery = `
            INSERT INTO orderdetail (quantity, sale_price, order_id, product_id)
            VALUES ?
        `;

        db.query(detailQuery, [values], (err) => {
            if (err) {
                console.error("❌ SQL Detail Error:", err);
                return res.status(500).json({
                    error: "Database error saving order details",
                    details: err.sqlMessage
                });
            }

            // 3️⃣ Respuesta final
            res.json({
                message: "Order created successfully",
                order_id: orderId,
                pickup_code
            });
        });
    });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT} and accessible via Network IP.`);
});