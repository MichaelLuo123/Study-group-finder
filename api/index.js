const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { Client: MailjetClient } = require('node-mailjet');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://192.168.1.3:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const client = new Client({
  user: 'postgres',
  host: process.env.NODE_ENV === 'production' ? '172.18.0.2' : process.env.CRAMR_DB_IP_ADDR,
  database: 'cramr_db',
  password: process.env.CRAMR_DB_POSTGRES_PASSWORD,
  port: 5432,
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
});
client.connect();

// Initialize Mailjet client
const mailjet = new MailjetClient({
  apiKey: process.env.MJ_APIKEY_PUBLIC || '5c0d15bd4bd31ce23181131a4714e8e1',
  apiSecret: process.env.MJ_APIKEY_PRIVATE || 'dcc70eeccd3807c5f055808b8e3261ad'
});

// Store OTP codes in memory (in production, use Redis or database)
const otpStore = new Map();

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Simple test endpoint that doesn't use database
app.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Get all events
app.get('/events', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create new event
app.post('/events', async (req, res) => {
  const { title, description, location, class: classField, date, tags, capacity, invitePeople } = req.body;
  
  try {
    // First create the event
    const result = await client.query(
      'INSERT INTO events (title, description, location, class, date_and_time, tags, capacity, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
      [title, description, location, classField, date, tags, capacity]
    );
    
    const event = result.rows[0];
    
    // If invite people are provided, create event attendee records
    if (invitePeople && invitePeople.length > 0) {
      for (const username of invitePeople) {
        // Find user by username
        const userResult = await client.query(
          'SELECT id FROM users WHERE username = $1',
          [username.trim()]
        );
        
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          
          // Add to event_attendees table
          await client.query(
            'INSERT INTO event_attendees (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT (event_id, user_id) DO NOTHING',
            [event.id, userId, 'invited']
          );
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// User signup
app.post('/signup', async (req, res) => {
  const { username, password, email, full_name } = req.body;
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Create new user
    const result = await client.query(
      'INSERT INTO users (username, password_hash, email, full_name, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, full_name',
      [username, passwordHash, email, full_name]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    // First get the user by username (without password check)
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    
    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all users (for testing)
app.get('/users', async (req, res) => {
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const result = await client.query(
      'SELECT id, username, email, full_name FROM users ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user's friends
app.get('/users/:id/friends', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('Friends request for user:', id);
    
    if (!client.connection) {
      console.log('Database not connected');
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    console.log('Executing friends query...');
    // Get accepted friends (both directions)
    const result = await client.query(`
      SELECT u.id, u.username, u.full_name, u.email
      FROM users u
      INNER JOIN friends f ON (f.friend_id = u.id AND f.user_id = $1) OR (f.user_id = u.id AND f.friend_id = $1)
      WHERE f.status = 'accepted'
      ORDER BY u.full_name
    `, [id]);
    
    console.log('Friends query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user profile settings
app.put('/users/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { 
    full_name, 
    major, 
    year, 
    bio, 
    profile_picture_url, 
    banner_color, 
    school, 
    pronouns, 
    transfer,
    prompt_1,
    prompt_1_answer,
    prompt_2,
    prompt_2_answer,
    prompt_3,
    prompt_3_answer,
    phone_number
  } = req.body;
  
  try {
    const result = await client.query(`
      UPDATE users 
      SET 
        full_name = COALESCE($1, full_name),
        major = COALESCE($2, major),
        year = COALESCE($3, year),
        bio = COALESCE($4, bio),
        profile_picture_url = COALESCE($5, profile_picture_url),
        banner_color = COALESCE($6, banner_color),
        school = COALESCE($7, school),
        pronouns = COALESCE($8, pronouns),
        transfer = COALESCE($9, transfer),
        prompt_1 = COALESCE($10, prompt_1),
        prompt_1_answer = COALESCE($11, prompt_1_answer),
        prompt_2 = COALESCE($12, prompt_2),
        prompt_2_answer = COALESCE($13, prompt_2_answer),
        prompt_3 = COALESCE($14, prompt_3),
        prompt_3_answer = COALESCE($15, prompt_3_answer),
        phone_number = COALESCE($16, phone_number),
        updated_at = NOW()
      WHERE id = $17
      RETURNING *
    `, [
      full_name, major, year, bio, profile_picture_url, banner_color, 
      school, pronouns, transfer, prompt_1, prompt_1_answer, 
      prompt_2, prompt_2_answer, prompt_3, prompt_3_answer, phone_number, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user account settings
app.put('/users/:id/account', async (req, res) => {
  const { id } = req.params;
  const { email, phone_number, password } = req.body;
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    let query = 'UPDATE users SET updated_at = NOW()';
    let params = [id];
    let paramIndex = 2;
    
    if (email) {
      query += `, email = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }
    
    if (phone_number) {
      query += `, phone_number = $${paramIndex}`;
      params.push(phone_number);
      paramIndex++;
    }
    
    if (password) {
      query += `, password_hash = $${paramIndex}`;
      params.push(password); // In production, hash this password
      paramIndex++;
    }
    
    query += ` WHERE id = $1 RETURNING *`;
    
    const result = await client.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Account updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user notification preferences
app.put('/users/:id/notifications', async (req, res) => {
  const { id } = req.params;
  const { push_notifications_enabled, email_notifications_enabled, sms_notifications_enabled } = req.body;
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    let query = 'UPDATE users SET updated_at = NOW()';
    let params = [id];
    let paramIndex = 2;
    
    if (push_notifications_enabled !== undefined) {
      query += `, push_notifications_enabled = $${paramIndex}`;
      params.push(push_notifications_enabled);
      paramIndex++;
    }
    
    if (email_notifications_enabled !== undefined) {
      query += `, email_notifications_enabled = $${paramIndex}`;
      params.push(email_notifications_enabled);
      paramIndex++;
    }
    
    if (sms_notifications_enabled !== undefined) {
      query += `, sms_notifications_enabled = $${paramIndex}`;
      params.push(sms_notifications_enabled);
      paramIndex++;
    }
    
    query += ` WHERE id = $1 RETURNING *`;
    
    const result = await client.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Comprehensive user details update endpoint
app.put('/users/:id/details', async (req, res) => {
  const { id } = req.params;
  const { 
    email, phone_number, password,
    full_name, major, year, bio, school, pronouns,
    push_notifications_enabled, email_notifications_enabled, sms_notifications_enabled
  } = req.body;
  
  try {
    if (!client.connection) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    let query = 'UPDATE users SET updated_at = NOW()';
    let params = [id];
    let paramIndex = 2;
    
    // Account settings
    if (email) {
      query += `, email = $${paramIndex}`;
      params.push(email);
      paramIndex++;
    }
    
    if (phone_number) {
      query += `, phone_number = $${paramIndex}`;
      params.push(phone_number);
      paramIndex++;
    }
    
    if (password) {
      query += `, password_hash = $${paramIndex}`;
      params.push(password); // In production, hash this password
      paramIndex++;
    }
    
    // Profile settings
    if (full_name) {
      query += `, full_name = $${paramIndex}`;
      params.push(full_name);
      paramIndex++;
    }
    
    if (major) {
      query += `, major = $${paramIndex}`;
      params.push(major);
      paramIndex++;
    }
    
    if (year) {
      query += `, year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }
    
    if (bio) {
      query += `, bio = $${paramIndex}`;
      params.push(bio);
      paramIndex++;
    }
    
    if (school) {
      query += `, school = $${paramIndex}`;
      params.push(school);
      paramIndex++;
    }
    
    if (pronouns) {
      query += `, pronouns = $${paramIndex}`;
      params.push(pronouns);
      paramIndex++;
    }
    
    // Notification preferences
    if (push_notifications_enabled !== undefined) {
      query += `, push_notifications_enabled = $${paramIndex}`;
      params.push(push_notifications_enabled);
      paramIndex++;
    }
    
    if (email_notifications_enabled !== undefined) {
      query += `, email_notifications_enabled = $${paramIndex}`;
      params.push(email_notifications_enabled);
      paramIndex++;
    }
    
    if (sms_notifications_enabled !== undefined) {
      query += `, sms_notifications_enabled = $${paramIndex}`;
      params.push(sms_notifications_enabled);
      paramIndex++;
    }
    
    query += ` WHERE id = $1 RETURNING *`;
    
    const result = await client.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User details updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const event = eventResult.rows[0];


    const invitedResult = await client.query('SELECT user_id FROM event_attendees WHERE event_id = $1', [id]);
    const invited_ids = invitedResult.rows.map(row => row.user_id);

    const acceptedResult = await client.query(
      "SELECT user_id FROM event_attendees WHERE event_id = $1 AND status = 'accepted'",
      [id]
    );
    const accepted_ids = acceptedResult.rows.map(row => row.user_id);

    const declinedResult = await client.query(
      "SELECT user_id FROM event_attendees WHERE event_id = $1 AND status = 'declined'",
      [id]
    );
    const declined_ids = declinedResult.rows.map(row => row.user_id);


    res.json({
      ...event,
      invited_ids,
      invited_count: invited_ids.length,
      accepted_ids,
      accepted_count: accepted_ids.length,
      declined_ids,
      declined_count: declined_ids.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.put('/events/:id/location', async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;
  
  try {
    const result = await client.query(
      'UPDATE events SET location = $1 WHERE id = $2 RETURNING *',
      [location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Location updated successfully',
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete old entries endpoint
app.post('/admin/delete-old-entries', async (req, res) => {
  try {
    // Delete old events (older than 30 days)
    const eventsResult = await client.query(
      'DELETE FROM events WHERE date_and_time < NOW() - INTERVAL \'30 days\''
    );
    
    // Delete old event attendees (older than 60 days)
    const attendeesResult = await client.query(
      'DELETE FROM event_attendees WHERE rsvp_date < NOW() - INTERVAL \'60 days\''
    );
    
    // Delete old pending friendship requests (older than 30 days)
    const friendsResult = await client.query(
      'DELETE FROM friends WHERE status = \'pending\' AND created_at < NOW() - INTERVAL \'30 days\''
    );
    
    res.json({
      success: true,
      message: 'Old entries deleted successfully',
      deleted: {
        events: eventsResult.rowCount,
        attendees: attendeesResult.rowCount,
        friends: friendsResult.rowCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// TwoFactor Authentication endpoints
app.post('/twofactor/send-code', async (req, res) => {
  const { userEmail, username } = req.body;
  
  if (!userEmail || !username) {
    return res.status(400).json({ error: 'Email and username are required' });
  }
  
  try {
    // Generate 6-digit OTP
    const secretCode = Math.floor(Math.random() * 900000) + 100000;
    
    // Store OTP with user email as key
    otpStore.set(userEmail, {
      code: secretCode,
      timestamp: Date.now(),
      attempts: 0
    });
    
    // Send email with OTP
    const data = {
      Messages: [
        {
          From: {
            Email: "tylervo.2002@gmail.com",
            Name: "Cramr Team" 
          },
          To: [
            {
              Email: userEmail,
              Name: username
            },
          ],
          Subject: "Your One Time Passcode",
          TextPart: `Hello ${username},\n\nYou have tried to log in and your One Time Passcode is ${secretCode}. If you did not request a One Time Password, please change your password as soon as possible.\n\nThank you,\nThe Cramr Team`
        }
      ]
    };
    
    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request(data);
    
    const { Status } = result.body.Messages[0];
    
    if (Status === 'success') {
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to send OTP email' });
    }
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
});

app.post('/twofactor/verify-code', async (req, res) => {
  const { userEmail, otp } = req.body;
  
  if (!userEmail || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  
  try {
    const storedData = otpStore.get(userEmail);
    
    if (!storedData) {
      return res.status(400).json({ error: 'No OTP found for this email' });
    }
    
    // Check if OTP is expired (15 minutes)
    const now = Date.now();
    const otpAge = now - storedData.timestamp;
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (otpAge > fifteenMinutes) {
      otpStore.delete(userEmail);
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    // Check if too many attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(userEmail);
      return res.status(400).json({ error: 'Too many failed attempts' });
    }
    
    // Verify OTP
    if (storedData.code.toString() === otp.toString()) {
      // Clear OTP after successful verification
      otpStore.delete(userEmail);
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      // Increment attempts
      storedData.attempts += 1;
      otpStore.set(userEmail, storedData);
      
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {});
