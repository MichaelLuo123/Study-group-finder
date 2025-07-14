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

//test inserting
const insertQuery = `
  INSERT INTO users (username, password_hash, email)
  VALUES ('nodejsinserttest', 'innoutcrambuthashed', 'insertsuccessful@ucsd.edu')
`;

client.query(insertQuery)
  .then(() => console.log('Test user inserted!\n'))
  .catch((err) => console.error('Error inserting test user\n', err.stack));

//test querying
const selectQuery = 'SELECT * FROM users';

client.query(selectQuery)
  .then(res => {
    console.log('Users:\n', res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Error querying users\n', err.stack);
    client.end();
  });