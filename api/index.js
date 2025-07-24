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

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {});
