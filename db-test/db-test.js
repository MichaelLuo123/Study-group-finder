const { Client } = require('pg'); // import pg library

//setup connection
const client = new Client({
    user: 'postgres',      // postgresql user
    host: '132.249.242.182',     //IP address of Docker container
    database: 'cramr_db',  // database name
    password: 'innoutmilkshake', // postgresql password
    port: 5432,
});


//test creating tables

// const createTablesQuery = `
// CREATE EXTENSION IF NOT EXISTS "pgcrypto";

// CREATE TABLE IF NOT EXISTS users (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     username VARCHAR(32) NOT NULL UNIQUE,
//     password_hash VARCHAR(128) NOT NULL,
//     email VARCHAR(254) NOT NULL UNIQUE,
//     full_name VARCHAR(40),
//     major VARCHAR(100),
//     year VARCHAR(20),
//     bio TEXT,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// CREATE TABLE IF NOT EXISTS events (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     title VARCHAR(100) NOT NULL,
//     description VARCHAR(1000),
//     location VARCHAR(200),
//     date_and_time TIMESTAMP NOT NULL,
//     creator_id uuid NOT NULL REFERENCES users(id),
//     created_at TIMESTAMP DEFAULT now(),
//     event_type VARCHAR(50),
//     status VARCHAR(50) DEFAULT 'active',
//     capacity INTEGER,
//     tags TEXT[]
// );

// CREATE TABLE IF NOT EXISTS event_attendees (
//     event_id uuid NOT NULL REFERENCES events(id),
//     user_id uuid NOT NULL REFERENCES users(id),
//     status VARCHAR(50),
//     rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     PRIMARY KEY (event_id, user_id)
// );
// `;

// client.connect()
//   .then(() => {
//     console.log('Connected to PostgreSQL');
//     return client.query(createTablesQuery);
//   })
//   .then(() => {
//     console.log('Tables "users", "events", and "event_attendees" created or already exist.');
//   })
//   .catch(err => {
//     console.error('Error creating tables:', err.stack);
//   })
//   .finally(() => {
//     client.end();
//   });




// //test inserting
// const insertUserQuery = `
//     INSERT INTO users (username, password_hash, email, full_name, major, year, bio, created_at, updated_at)
//     VALUES ('kevinyang123', 'hashedpassword', 'alice@ucsd.edu', 'Kevin Yang', 'Computer Science', 'Senior', 'I love In-N-Out', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
// `;

// client.query(insertUserQuery)
//   .then(() => console.log('Test user inserted!\n'))
//   .catch((err) => console.error('Error inserting test user\n', err.stack));

// const insertEventQuery = `
//     INSERT INTO events (title, description, location, date_and_time, creator_id, created_at, event_type, status, capacity, tags, participant_ids)
//     VALUES ('CS101 Study Group', 'Study group for CS101: Introduction to Computer Science', 'Room 101, UCSD', '2025-09-15 10:00:00', '37bd4d1a-fd0e-4f43-8fd5-d3d436da39e2'::UUID, CURRENT_TIMESTAMP, 'In-person', 'Upcoming', 30, 
//     ARRAY['CS101', 'Computer Science', 'Quiet'], ARRAY['37bd4d1a-fd0e-4f43-8fd5-d3d436da39e2'::UUID])
// `;

// client.query(insertEventQuery)
//   .then(() => console.log('Test user inserted!\n'))
//   .catch((err) => console.error('Error inserting test event\n', err.stack));

// const insertEventAttendeesQuery = `
//   INSERT INTO event_attendees (event_id, user_id, status, rsvp_date)
//   VALUES 
//     ('6dcba350-62b0-4e08-b54f-19331dbc79eb'::UUID,
//     '37bd4d1a-fd0e-4f43-8fd5-d3d436da39e2'::UUID,
//     'Invited',
//     CURRENT_TIMESTAMP)
//   ON CONFLICT (event_id, user_id) DO NOTHING;  -- Prevent duplicate entries
// `;

// client.query(insertEventAttendeesQuery)
// .then(() => console.log('Event attendee inserted!\n'))
// .catch((err) => console.error('Error inserting test event attendee\n', err.stack));

//test querying
const selectUsersQuery = 'SELECT * FROM users';
const selectEventsQuery = 'SELECT * FROM events';
const selectEventAttendeesQuery = 'SELECT * FROM event_attendees';

client.query(selectUsersQuery)
  .then(res => {
    console.log('Users:\n', res.rows);
    return client.query(selectEventsQuery);
  })
  .then(res => {
    console.log('Events:\n', res.rows);
    return client.query(selectEventAttendeesQuery);
  })
  .then(res => {
    console.log('Event Attendees:\n', res.rows);
  })
  .catch(err => {
    console.error('Error querying data\n', err.stack);
  })
  .finally(() => {
    client.end();
  });