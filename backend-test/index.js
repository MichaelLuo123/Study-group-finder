const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Set up PostgreSQL client
const client = new Client({
  user: 'postgres',
  host: '132.249.242.182',
  database: 'cramr_db',
  password: 'innoutmilkshake',
  port: 5432,
});
client.connect();

app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eventResult = await client.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    const event = eventResult.rows[0];

    // Get invited and RSVP'd users
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

    // Build response object
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));
