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
        'http://192.168.0.8:4008'
    ],
    credentials: true
}));

app.use(express.json());

// MySQL Database Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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
    const query = `INSERT INTO customers (name, phone, email, address, password) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [name, phone, email, address, password], (err, result) => {
        if (err) {
            console.error('SQL Register Error:', err);
            return res.status(500).json({ error: 'Database error during registration' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT} and accessible via Network IP.`);
});