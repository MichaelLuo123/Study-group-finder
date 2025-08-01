const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const { Client: MailjetClient } = require('node-mailjet');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:8081',  // Expo dev server
    'http://localhost:3000',  // Alternative dev port
    'http://192.168.1.3:8081', // Your local IP with dev port
    'http://localhost:19006', // Expo web dev server
    'http://192.168.1.3:19006' // Your local IP with Expo web port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors({
  origin: [
    'http://localhost:8081',  // Expo dev server
    'http://localhost:3000',  // Alternative dev port
    'http://192.168.1.3:8081', // Your local IP with dev port
    'http://localhost:19006', // Expo web dev server
    'http://192.168.1.3:19006' // Your local IP with Expo web port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const client = new Client({
  user: 'postgres',
  host: process.env.NODE_ENV === 'production' ? 'postgres' : process.env.CRAMR_DB_IP_ADDR,
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all events
app.get('/events', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        e.*,
        u.full_name as creator_name,
        u.profile_picture_url as creator_profile_picture,
        u.username as creator_username
      FROM events e
      LEFT JOIN users u ON e.creator_id = u.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create new event
app.post('/events', async (req, res) => {
  const { title, description, location, class: classField, date, tags, capacity, invitePeople, creator_id } = req.body;
  
  try {
    // First create the event
    const result = await client.query(
      'INSERT INTO events (title, description, location, class, date_and_time, tags, capacity, creator_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [title, description, location, classField, date, tags, capacity, creator_id]
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
  const { username, password, email, full_name, created_at } = req.body;
  
  if (!username || !password || !email || !full_name) {
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
    
    // Insert new user with provided created_at or use NOW()
    const result = await client.query(
      'INSERT INTO users (username, password_hash, email, full_name, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name',
      [username, passwordHash, email, full_name, created_at || new Date().toISOString()]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to register user. Please try again.' });
  }
});

// User login
app.post('/login', async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Failed to log in. Please try again.' });
  }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
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
    // Get accepted friends (both directions)
    const result = await client.query(`
      SELECT u.id, u.username, u.full_name, u.email
      FROM users u
      INNER JOIN friends f ON (f.friend_id = u.id AND f.user_id = $1) OR (f.user_id = u.id AND f.friend_id = $1)
      WHERE f.status = 'accepted'
      ORDER BY u.full_name
    `, [id]);
    
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
    prompt_3_answer
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
        updated_at = NOW()
      WHERE id = $16
      RETURNING *
    `, [
      full_name, major, year, bio, profile_picture_url, banner_color, 
      school, pronouns, transfer, prompt_1, prompt_1_answer, 
      prompt_2, prompt_2_answer, prompt_3, prompt_3_answer, id
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
  const { email, password } = req.body;
  
  try {
    let query = 'UPDATE users SET updated_at = NOW()';
    let params = [id];
    let paramIndex = 2;
    
    if (email) {
      query += `, email = $${paramIndex}`;
      params.push(email);
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

// Update user preferences
app.put('/users/:id/preferences', async (req, res) => {
  const { id } = req.params;
  const { 
    push_notifications, 
    email_notifications, 
    sms_notifications, 
    theme 
  } = req.body;
  
  try {
    // For now, we'll store preferences as JSON in a new column
    // You might want to add these columns to your users table
    const preferences = {
      push_notifications: push_notifications || false,
      email_notifications: email_notifications || false,
      sms_notifications: sms_notifications || false,
      theme: theme || 'light'
    };
    
    // For demo purposes, we'll update a text field with JSON
    // In production, you'd add preference columns to your users table
    const result = await client.query(`
      UPDATE users 
      SET updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: preferences
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventResult = await client.query(`
      SELECT 
        e.*,
        u.full_name as creator_name,
        u.profile_picture_url as creator_profile_picture,
        u.username as creator_username
      FROM events e
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE e.id = $1
    `, [id]);
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

// Image upload endpoints
app.post('/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

// Error handling for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: 'File upload error', details: error.message });
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  
  next(error);
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database host:', process.env.NODE_ENV === 'production' ? 'postgres' : process.env.CRAMR_DB_IP_ADDR);
});
