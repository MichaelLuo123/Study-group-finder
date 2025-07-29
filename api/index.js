const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
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

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
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
  
  try {
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
      'INSERT INTO users (username, password, email, full_name, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, email, full_name',
      [username, password, email, full_name]
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
    const result = await client.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
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

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {});
