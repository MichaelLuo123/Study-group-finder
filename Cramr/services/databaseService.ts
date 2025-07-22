const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

//setup for postgres connection
const client = new Client({
    user: 'postgres',
    host: '132.249.242.182',
    database: 'cramr_db',
    password: 'innoutanimalfries',
    port: 5432,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
(async () => {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
    } catch (err) {
        console.error('Failed to connect to PostgreSQL:', err);
    }
})();

// POST /signup endpoint
app.post('/signup', async (req: any, res: any) => {
    const { username, password, email, full_name, created_at } = req.body;
    if (!username || !password || !email || !full_name || !created_at) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    try {
        // Check if email is already taken
        const emailExists = await client.query(
            'SELECT 1 FROM users WHERE email = $1',
            [email]
        );
        if (emailExists.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this email already exists' });
        }
        // Check if username is already taken
        const usernameExists = await client.query(
            'SELECT 1 FROM users WHERE username = $1',
            [username]
        );
        if (usernameExists.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Username is already taken' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Insert new user
        await client.query(
            'INSERT INTO users (username, password_hash, email, full_name, created_at) VALUES ($1, $2, $3, $4, $5)',
            [username, passwordHash, email, full_name, created_at]
        );
        return res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to register user. Please try again.' });
    }
});

// POST /login endpoint
app.post('/login', async (req: any, res: any) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Missing email or password' });
    }
    try {
        // Look up user by email
        const userResult = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email' });
        }
        const user = userResult.rows[0];
        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
        return res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to log in. Please try again.' });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
}); 