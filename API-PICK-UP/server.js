/**
 * API-Pick-up/server.js
 * Express server configuration with MySQL connection.
 * Handles API endpoints for fetching order data.
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// MySQL Database Connection Configuration
// Uses XAMPP default credentials
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

// GET /api/v1/orders
// Fetches all orders with joined store details.
// columns are aliased to English names for frontend consistency.
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});