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
// Enable preflight for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
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
    console.log('Fetching events with creator info...');
    const result = await client.query(`
      SELECT 
        e.*,
        u.full_name as creator_name,
        u.profile_picture_url as creator_profile_picture,
        u.username as creator_username
      FROM events e
      LEFT JOIN users u ON e.creator_id::uuid = u.id::uuid
      ORDER BY e.created_at DESC
    `);
    
    console.log('Query result:', result.rows);
   
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Create new event
app.post('/events', async (req, res) => {
  const { title, description, location, class: classField, date, tags, capacity, invitePeople, creator_id } = req.body;
  
  // Validate required fields
  if (!title || !creator_id) {
    return res.status(400).json({ error: 'Missing required fields: title and creator_id are required' });
  }

  try {
    // Verify that the creator_id exists in the users table
    const creatorCheck = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [creator_id]
    );
    
    if (creatorCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid creator_id: user not found' });
    }

    // First create the event
    const result = await client.query(
      'INSERT INTO events (title, description, location, class, date_and_time, tags, capacity, creator_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [title, description, location, classField, date, tags, capacity, creator_id]
    );
    
    const event = result.rows[0];
    
    // If invite people are provided, create event attendee records
    if (invitePeople && invitePeople.length > 0) {
      for (const userId of invitePeople) {
        // Validate that the user exists
        const userResult = await client.query(
          'SELECT id FROM users WHERE id = $1',
          [userId]
        );
        
        if (userResult.rows.length > 0) {
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
    console.error('Error creating event:', err);
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
    // Check both email and username simultaneously
    const [emailExists, usernameExists] = await Promise.all([
      client.query('SELECT 1 FROM users WHERE email = $1', [email]),
      client.query('SELECT 1 FROM users WHERE username = $1', [username])
    ]);
    
    console.log('Email check result:', { email, exists: emailExists.rows.length > 0 });
    console.log('Username check result:', { username, exists: usernameExists.rows.length > 0 });
    
    // Collect all errors
    const errors = {};
    if (emailExists.rows.length > 0) {
      errors.email = 'User with this email already exists';
    }
    if (usernameExists.rows.length > 0) {
      errors.username = 'Username is already taken';
    }
    
    // If there are any conflicts, return all errors
    if (Object.keys(errors).length > 0) {
      console.log('Returning 409 for conflicts:', errors);
      return res.status(409).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors
      });
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

// Search users
app.get('/users/search', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }
  
  try {
    const result = await client.query(`
      SELECT id, username, full_name, email
      FROM users 
      WHERE 
        LOWER(username) LIKE LOWER($1) OR 
        LOWER(full_name) LIKE LOWER($1) OR
        LOWER(email) LIKE LOWER($1)
      ORDER BY 
        CASE 
          WHEN LOWER(username) = LOWER($1) THEN 1
          WHEN LOWER(full_name) = LOWER($1) THEN 2
          ELSE 3
        END,
        username
      LIMIT 20
    `, [`%${q}%`]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
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

// Send friend request
app.post('/users/:id/friends', async (req, res) => {
  const { id } = req.params;
  const { friendId } = req.body;
  
  if (!friendId) {
    return res.status(400).json({ error: 'friendId is required' });
  }
  
  if (id === friendId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }
  
  try {
    // Check if both users exist
    const [userResult, friendResult] = await Promise.all([
      client.query('SELECT id FROM users WHERE id = $1', [id]),
      client.query('SELECT id FROM users WHERE id = $1', [friendId])
    ]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (friendResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend not found' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await client.query(`
      SELECT * FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `, [id, friendId]);
    
    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      if (friendship.status === 'accepted') {
        return res.status(409).json({ error: 'Already friends' });
      } else if (friendship.status === 'pending') {
        return res.status(409).json({ error: 'Friend request already sent' });
      }
    }
    
    // Create friend request
    const result = await client.query(`
      INSERT INTO friends (user_id, friend_id, status) 
      VALUES ($1, $2, 'pending')
      RETURNING *
    `, [id, friendId]);
    
    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      friendship: result.rows[0]
    });
  } catch (err) {
    console.error('Send friend request error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Accept friend request
app.put('/users/:id/friends/:friendId', async (req, res) => {
  const { id, friendId } = req.params;
  const { action } = req.body; // 'accept' or 'decline'
  
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'action must be accept or decline' });
  }
  
  try {
    // Check if friend request exists
    const friendshipResult = await client.query(`
      SELECT * FROM friends 
      WHERE friend_id = $1 AND user_id = $2 AND status = 'pending'
    `, [id, friendId]);
    
    if (friendshipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    
    // Update friendship status
    const result = await client.query(`
      UPDATE friends 
      SET status = $1 
      WHERE friend_id = $2 AND user_id = $3
      RETURNING *
    `, [newStatus, id, friendId]);
    
    res.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      friendship: result.rows[0]
    });
  } catch (err) {
    console.error('Update friendship error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Remove friend
app.delete('/users/:id/friends/:friendId', async (req, res) => {
  const { id, friendId } = req.params;
  
  try {
    // Delete friendship (both directions)
    const result = await client.query(`
      DELETE FROM friends 
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
      RETURNING *
    `, [id, friendId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }
    
    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (err) {
    console.error('Remove friend error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get pending friend requests (received)
app.get('/users/:id/friend-requests', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      SELECT 
        u.id, u.username, u.full_name, u.email,
        f.created_at as request_date
      FROM users u
      INNER JOIN friends f ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      friend_requests: result.rows
    });
  } catch (err) {
    console.error('Get friend requests error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Follow a user
app.post('/users/:id/follow', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  if (id === userId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }
  
  try {
    // Check if already following
    const existingFollow = await client.query(`
      SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2
    `, [id, userId]);
    
    if (existingFollow.rows.length > 0) {
      return res.status(409).json({ error: 'Already following this user' });
    }
    
    // Create follow relationship
    const result = await client.query(`
      INSERT INTO follows (follower_id, following_id) 
      VALUES ($1, $2)
      RETURNING *
    `, [id, userId]);
    
    res.status(201).json({
      success: true,
      message: 'Now following user',
      follow: result.rows[0]
    });
  } catch (err) {
    console.error('Follow user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Unfollow a user
app.delete('/users/:id/follow/:userId', async (req, res) => {
  const { id, userId } = req.params;
  
  try {
    const result = await client.query(`
      DELETE FROM follows 
      WHERE follower_id = $1 AND following_id = $2
      RETURNING *
    `, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }
    
    res.json({
      success: true,
      message: 'Unfollowed successfully'
    });
  } catch (err) {
    console.error('Unfollow user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get users that the current user is following
app.get('/users/:id/following', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      SELECT 
        u.id, u.username, u.full_name, u.email,
        f.created_at as follow_date
      FROM users u
      INNER JOIN follows f ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      following: result.rows
    });
  } catch (err) {
    console.error('Get following error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get users that are following the current user
app.get('/users/:id/followers', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      SELECT 
        u.id, u.username, u.full_name, u.email,
        f.created_at as follow_date
      FROM users u
      INNER JOIN follows f ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      followers: result.rows
    });
  } catch (err) {
    console.error('Get followers error:', err);
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
  const { email, password, phone_number } = req.body;
  
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
    
    if (phone_number) {
      query += `, phone_number = $${paramIndex}`;
      params.push(phone_number);
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
    // Update the actual notification preference columns in the users table
    const result = await client.query(`
      UPDATE users 
      SET 
        push_notifications_enabled = COALESCE($1, push_notifications_enabled),
        email_notifications_enabled = COALESCE($2, email_notifications_enabled),
        sms_notifications_enabled = COALESCE($3, sms_notifications_enabled),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [push_notifications, email_notifications, sms_notifications, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: {
        push_notifications: user.push_notifications_enabled,
        email_notifications: user.email_notifications_enabled,
        sms_notifications: user.sms_notifications_enabled,
        theme: theme || 'light' // Theme is not stored in DB, so we return the requested theme
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user preferences
app.get('/users/:id/preferences', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      SELECT 
        push_notifications_enabled,
        email_notifications_enabled,
        sms_notifications_enabled
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      preferences: {
        push_notifications: user.push_notifications_enabled,
        email_notifications: user.email_notifications_enabled,
        sms_notifications: user.sms_notifications_enabled,
        theme: 'light' // Default theme since it's not stored in DB
      }
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

    // Get attendee counts from event_attendees table
    const invitedResult = await client.query(
      "SELECT COUNT(*) as count FROM event_attendees WHERE event_id = $1 AND status = 'invited'",
      [id]
    );
    const invited_count = parseInt(invitedResult.rows[0].count);

    const acceptedResult = await client.query(
      "SELECT COUNT(*) as count FROM event_attendees WHERE event_id = $1 AND status = 'accepted'",
      [id]
    );
    const accepted_count = parseInt(acceptedResult.rows[0].count);

    const declinedResult = await client.query(
      "SELECT COUNT(*) as count FROM event_attendees WHERE event_id = $1 AND status = 'declined'",
      [id]
    );
    const declined_count = parseInt(declinedResult.rows[0].count);

    // Get user IDs for each status
    const invitedUsersResult = await client.query(
      "SELECT user_id FROM event_attendees WHERE event_id = $1 AND status = 'invited'",
      [id]
    );
    const invited_ids = invitedUsersResult.rows.map(row => row.user_id);

    const acceptedUsersResult = await client.query(
      "SELECT user_id FROM event_attendees WHERE event_id = $1 AND status = 'accepted'",
      [id]
    );
    const accepted_ids = acceptedUsersResult.rows.map(row => row.user_id);

    const declinedUsersResult = await client.query(
      "SELECT user_id FROM event_attendees WHERE event_id = $1 AND status = 'declined'",
      [id]
    );
    const declined_ids = declinedUsersResult.rows.map(row => row.user_id);

    res.json({
      ...event,
      invited_ids,
      invited_count,
      accepted_ids,
      accepted_count,
      declined_ids,
      declined_count,
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

// Delete event
app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Delete event (this will cascade delete event_attendees due to foreign key)
    const result = await client.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// RSVP endpoints
app.post('/events/:eventId/rsvpd', async (req, res) => {
  const { eventId } = req.params;
  const { user_id, status } = req.body;
  
  if (!user_id || !status) {
    return res.status(400).json({ error: 'user_id and status are required' });
  }
  
  if (!['accepted', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted, declined, or pending' });
  }
  
  try {
    // Check if event exists
    const eventResult = await client.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user exists
    const userResult = await client.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Insert or update RSVP
    const result = await client.query(`
      INSERT INTO event_attendees (event_id, user_id, status, rsvp_date) 
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (event_id, user_id) 
      DO UPDATE SET status = $3, rsvp_date = NOW()
      RETURNING *
    `, [eventId, user_id, status]);
    
    res.json({
      success: true,
      message: 'RSVP updated successfully',
      rsvp: result.rows[0]
    });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/events/:eventId/rsvpd', async (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.query;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id query parameter is required' });
  }
  
  try {
    const result = await client.query(
      'SELECT * FROM event_attendees WHERE event_id = $1 AND user_id = $2',
      [eventId, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        rsvp: null,
        message: 'No RSVP found for this user and event'
      });
    }
    
    res.json({
      success: true,
      rsvp: result.rows[0]
    });
  } catch (err) {
    console.error('Get RSVP error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.delete('/events/:eventId/rsvpd', async (req, res) => {
  const { eventId } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  try {
    const result = await client.query(
      'DELETE FROM event_attendees WHERE event_id = $1 AND user_id = $2 RETURNING *',
      [eventId, user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'RSVP not found' });
    }
    
    res.json({
      success: true,
      message: 'RSVP removed successfully'
    });
  } catch (err) {
    console.error('Delete RSVP error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update RSVP status
app.put('/events/:eventId/rsvpd', async (req, res) => {
  const { eventId } = req.params;
  const { user_id, status } = req.body;
  
  if (!user_id || !status) {
    return res.status(400).json({ error: 'user_id and status are required' });
  }
  
  if (!['accepted', 'declined', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted, declined, or pending' });
  }
  
  try {
    // Check if event exists
    const eventResult = await client.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user exists
    const userResult = await client.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if RSVP exists
    const existingRsvp = await client.query(
      'SELECT * FROM event_attendees WHERE event_id = $1 AND user_id = $2',
      [eventId, user_id]
    );
    
    if (existingRsvp.rows.length === 0) {
      return res.status(404).json({ error: 'RSVP not found. User must have an existing RSVP to update.' });
    }
    
    // Update RSVP status
    const result = await client.query(`
      UPDATE event_attendees 
      SET status = $1, rsvp_date = NOW()
      WHERE event_id = $2 AND user_id = $3
      RETURNING *
    `, [status, eventId, user_id]);
    
    res.json({
      success: true,
      message: 'RSVP status updated successfully',
      rsvp: result.rows[0]
    });
  } catch (err) {
    console.error('Update RSVP error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all RSVPs for an event
app.get('/events/:eventId/rsvps', async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const result = await client.query(`
      SELECT 
        ea.*,
        u.username,
        u.full_name,
        u.profile_picture_url
      FROM event_attendees ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.rsvp_date DESC
    `, [eventId]);
    
    res.json({
      success: true,
      rsvps: result.rows
    });
  } catch (err) {
    console.error('Get RSVPs error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Saved events endpoints
app.post('/users/:id/saved-events', async (req, res) => {
  const { id } = req.params;
  const { event_id } = req.body;
  
  if (!event_id) {
    return res.status(400).json({ error: 'event_id is required' });
  }
  
  try {
    // Check if user exists
    const userResult = await client.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if event exists
    const eventResult = await client.query('SELECT id FROM events WHERE id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // First, let's create a saved_events table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_events (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, event_id)
      )
    `);
    
    // Insert saved event
    const result = await client.query(`
      INSERT INTO saved_events (user_id, event_id) 
      VALUES ($1, $2)
      ON CONFLICT (user_id, event_id) DO NOTHING
      RETURNING *
    `, [id, event_id]);
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Event already saved',
        saved: true
      });
    }
    
    res.json({
      success: true,
      message: 'Event saved successfully',
      saved_event: result.rows[0]
    });
  } catch (err) {
    console.error('Save event error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/users/:id/saved-events', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, ensure the saved_events table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_events (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, event_id)
      )
    `);
    
    const result = await client.query(`
      SELECT 
        e.*,
        u.full_name as creator_name,
        u.profile_picture_url as creator_profile_picture,
        u.username as creator_username,
        se.saved_at
      FROM saved_events se
      JOIN events e ON se.event_id = e.id
      LEFT JOIN users u ON e.creator_id = u.id
      WHERE se.user_id = $1
      ORDER BY se.saved_at DESC
    `, [id]);
    
    res.json({
      success: true,
      saved_events: result.rows
    });
  } catch (err) {
    console.error('Get saved events error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.delete('/users/:userId/saved-events/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  
  try {
    const result = await client.query(
      'DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2 RETURNING *',
      [id, eventId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saved event not found' });
    }
    
    res.json({
      success: true,
      message: 'Event removed from saved events'
    });
  } catch (err) {
    console.error('Remove saved event error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.get('/users/:id/saved-events/:eventId', async (req, res) => {
  const { id, eventId } = req.params;
  
  try {
    const result = await client.query(
      'SELECT * FROM saved_events WHERE user_id = $1 AND event_id = $2',
      [id, eventId]
    );
    
    res.json({
      success: true,
      is_saved: result.rows.length > 0,
      saved_event: result.rows[0] || null
    });
  } catch (err) {
    console.error('Check saved event error:', err);
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
