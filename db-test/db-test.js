const { Client } = require('pg'); // import pg library

//setup connection
const client = new Client({
    user: 'postgres',      // postgresql user
    host: '132.249.242.182',     //IP address of Docker container
    database: 'cramr_db',  // database name
    password: 'innoutmilkshake', // postgresql password
    port: 5432,
});

//connecting to postgresql database
client.connect()
  .then(() => console.log('PostgreSQL Connected!'))
  .catch((err) => console.error('Connection error', err.stack));

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
//   .catch((err) => console.error('Error inserting test Event\n', err.stack));

//test querying
const selectUsersQuery = 'SELECT * FROM users';
const selectEventsQuery = 'SELECT * FROM events';

client.query(selectUsersQuery)
  .then(res => {
    console.log('Users:\n', res.rows);
    return client.query(selectEventsQuery);
  })
  .then(res => {
    console.log('Events:\n', res.rows);
  })
  .catch(err => {
    console.error('Error querying data\n', err.stack);
  })
  .finally(() => {
    client.end();
  });