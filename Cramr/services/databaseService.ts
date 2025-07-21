const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

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
        // Check if user already exists by email or username
        const userExists = await client.query(
            'SELECT 1 FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        if (userExists.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this email or username already exists' });
        }
        // Insert new user
        await client.query(
            'INSERT INTO users (username, password_hash, email, full_name, created_at) VALUES ($1, $2, $3, $4, $5)',
            [username, password, email, full_name, created_at]
        );
        return res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to register user. Please try again.' });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
}); 