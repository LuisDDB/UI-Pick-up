/**
 * API-Pick-up/server.js
 * Express server with MySQL connection.
 * Handles Admin & Employee APIs.
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
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

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aliz',
    database: 'pickup'
});

db.connect(err => {
    if(err) { console.error('DB Error:', err); return; }
    console.log('✅ Connected to MySQL: pickup');
});

/** API **/

// --- Orders ---
// Admin: all orders
app.get('/api/v1/orders', (req, res) => {
    const query = `
        SELECT o.order_id AS id, DATE_FORMAT(o.order_date, '%d/%m/%Y') AS date,
               o.state AS status, o.total, o.pickup_code,
               s.name AS store
        FROM \`order\` o
        JOIN store s ON o.store_id = s.store_id
        ORDER BY o.order_id DESC
    `;
    db.query(query, (err, results) => {
        if(err) return res.status(500).send('Server Error');
        res.json(results);
    });
});

// Employee: orders by store
app.get('/api/v1/orders/store/:storeId', (req,res)=>{
    const storeId = req.params.storeId;
    const query = `
        SELECT o.order_id AS id, DATE_FORMAT(o.order_date, '%d/%m/%Y') AS date,
               o.state AS status, o.total, o.pickup_code,
               s.name AS store
        FROM \`order\` o
        JOIN store s ON o.store_id = s.store_id
        WHERE o.store_id = ?
        ORDER BY o.order_id DESC
    `;
    db.query(query,[storeId], (err,results)=>{
        if(err) return res.status(500).send('Server Error');
        res.json(results);
    });
});

// --- Employees ---
// List all employees
app.get('/api/v1/employees', (req,res)=>{
    const query = `SELECT employee_id AS id, name, email, store_id FROM employee`;
    db.query(query, (err, results)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json(results);
    });
});

// Add employee
app.post('/api/v1/employees', (req,res)=>{
    const { name, email, password, store_id } = req.body;
    if(!name || !email || !password) return res.status(400).json({error:'Missing fields'});
    const query = `INSERT INTO employee (name,email,password,store_id) VALUES (?,?,?,?)`;
    db.query(query,[name,email,password,store_id || null], (err,result)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Employee added', id: result.insertId});
    });
});

// Delete employee
app.delete('/api/v1/employees/:id', (req,res)=>{
    const id = req.params.id;
    const query = `DELETE FROM employee WHERE employee_id=?`;
    db.query(query,[id],(err)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Employee deleted'});
    });
});

// --- Stores ---
// List stores
app.get('/api/v1/store',(req,res)=>{
    const query = `SELECT store_id,name,address,phone,schedule FROM store`;
    db.query(query,(err,results)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json(results);
    });
});

// Add store
app.post('/api/v1/store',(req,res)=>{
    const { name,address,phone,schedule } = req.body;
    if(!name) return res.status(400).json({error:'Missing name'});
    const query = `INSERT INTO store (name,address,phone,schedule) VALUES (?,?,?,?)`;
    db.query(query,[name,address,phone,schedule],(err,result)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Store added', id: result.insertId});
    });
});

// Delete store
app.delete('/api/v1/store/:id',(req,res)=>{
    const id = req.params.id;
    const query = `DELETE FROM store WHERE store_id=?`;
    db.query(query,[id],(err)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Store deleted'});
    });
});

// --- Products ---
// List products by store
app.get('/api/v1/product/store/:storeId',(req,res)=>{
    const storeId = req.params.storeId;
    const query = `SELECT product_id,name,description,price,store_id FROM product WHERE store_id=?`;
    db.query(query,[storeId],(err,results)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json(results);
    });
});

// Add product
app.post('/api/v1/product',(req,res)=>{
    const { name, description, price, store_id } = req.body;
    if(!name || !store_id) return res.status(400).json({error:'Missing fields'});
    const query = `INSERT INTO product (name,description,price,store_id) VALUES (?,?,?,?)`;
    db.query(query,[name,description,price,store_id],(err,result)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Product added', id: result.insertId});
    });
});

// Delete product
app.delete('/api/v1/product/:id',(req,res)=>{
    const id = req.params.id;
    const query = `DELETE FROM product WHERE product_id=?`;
    db.query(query,[id],(err)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        res.json({message:'Product deleted'});
    });
});

// --- Create Order ---
app.post('/api/v1/order',(req,res)=>{
    const { client_id, store_id, total, items } = req.body;
    if(!client_id || !store_id || !items?.length) return res.status(400).json({error:'Missing fields'});
    const pickup_code = Math.random().toString(36).substring(2,8).toUpperCase();
    const orderQuery = `INSERT INTO \`order\` (client_id,store_id,total,pickup_code) VALUES (?,?,?,?)`;
    db.query(orderQuery,[client_id,store_id,total,pickup_code],(err,orderResult)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        const orderId = orderResult.insertId;
        const values = items.map(item => [item.qty,item.price,orderId,item.product_id]);
        const detailQuery = `INSERT INTO orderdetail (quantity,sale_price,order_id,product_id) VALUES ?`;
        db.query(detailQuery,[values],(err)=>{
            if(err) return res.status(500).json({error:'DB Error saving details'});
            res.json({message:'Order created', order_id:orderId, pickup_code});
        });
    });
});
//admin login 
// LOGIN ADMIN
app.post('/api/v1/admin/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const query = `
        SELECT admin_id AS id, name, email, store_id
        FROM admin
        WHERE LOWER(email) = LOWER(?) AND TRIM(password) = TRIM(?)
    `;

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('SQL Admin Login Error:', err);
            return res.status(500).json({ error: 'Error en base de datos' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Generar token simple
        const token = `admin-token-${results[0].id}-${Date.now()}`;

        res.json({
            message: 'Login exitoso',
            admin: {
                id: results[0].id,
                name: results[0].name,
                email: results[0].email,
                store_id: results[0].store_id,
                token
            }
        });
    });
});

// --- Login Cliente ---
app.post('/api/v1/login', (req,res)=>{
    const { email, password } = req.body;
    const query = `SELECT client_id AS id, name, email FROM client WHERE email=? AND password=?`;
    db.query(query,[email,password],(err,results)=>{
        if(err) return res.status(500).json({error:'DB Error'});
        if(results.length === 0) return res.status(401).json({error:'Usuario o contraseña incorrectos'});
        const token = `token-${results[0].id}-${Date.now()}`;
        res.json({client: results[0], token});
    });
});

app.post('/api/v1/employee/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const query = `
        SELECT employee_id AS id, name, email, role, store_id
        FROM employee
        WHERE LOWER(email) = LOWER(?) AND TRIM(password) = TRIM(?)
    `;

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('SQL Employee Login Error:', err);
            return res.status(500).json({ error: 'Error en base de datos' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        // Generar un token simple (puedes cambiarlo después por JWT)
        const token = `employee-token-${results[0].id}-${Date.now()}`;

        res.json({
            message: 'Login exitoso',
            employee: {
                id: results[0].id,
                name: results[0].name,
                email: results[0].email,
                role: results[0].role,
                store_id: results[0].store_id,
                token
            }
        });
    });
});

// Start server
app.listen(PORT,'0.0.0.0',()=>console.log(`🚀 Server running at http://localhost:${PORT}`));
