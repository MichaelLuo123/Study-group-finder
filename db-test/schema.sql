-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    full_name VARCHAR(40),
    major VARCHAR(100),
    year VARCHAR(20),
    bio TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    location VARCHAR(200),
    date_and_time TIMESTAMP NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    capacity INTEGER,
    tags TEXT[]
);

-- Create event_attendees table
CREATE TABLE event_attendees (
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'invited',
    rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id)
);

-- Create friends table to manage user friendships
CREATE TABLE friends (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,   -- Foreign key referencing the user
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Foreign key referencing the friend
    status VARCHAR(20) DEFAULT 'pending',                   -- Friendship status (e.g., 'pending', 'accepted')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,         -- Timestamp for when the friendship was created
    PRIMARY KEY (user_id, friend_id)                        -- Composite primary key to ensure no duplicate friendships
);

-- -- Insert sample data into users
-- INSERT INTO users (username, password_hash, email, full_name, major, year, bio)
-- VALUES 
-- ('kevinyang123', 'hashedpassword', 'alice@ucsd.edu', 'Kevin Yang', 'Computer Science', 'Senior', 'I love In-N-Out');

-- -- Insert sample data into events
-- INSERT INTO events (title, description, location, date_and_time, creator_id, event_type, status, capacity, tags, invited_ids, rsvping_ids, invited_count)
-- VALUES 
-- ('CS101 Study Group', 'Study group for CS101: Introduction to Computer Science', 'Room 101, UCSD', '2025-09-15 10:00:00', 
--  '447f3ea2-b016-4c2a-ab1d-58ab876f4a37', 'In-person', 'Upcoming', 30, ARRAY['CS101', 'Computer Science', 'Quiet'], ARRAY['447f3ea2-b016-4c2a-ab1d-58ab876f4a37'], ARRAY[], 1);

-- -- Insert sample data into event_attendees
-- INSERT INTO event_attendees (event_id, user_id, status)
-- VALUES 
-- ('6dcba350-62b0-4e08-b54f-19331dbc79eb', '37bd4d1a-fd0e-4f43-8fd5-d3d436da39e2', 'Invited');

-- -- Insert sample data into friends
-- INSERT INTO friends (user_id, friend_id, status)
-- VALUES ('user_uuid_1', 'user_uuid_2', 'accepted');

-- Query to see the data in the tables
SELECT * FROM users;
SELECT * FROM events;
SELECT * FROM event_attendees;