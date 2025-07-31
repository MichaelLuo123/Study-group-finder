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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transfer BOOLEAN DEFAULT false,
    banner_color VARCHAR(100),
    school VARCHAR(100),
    pronouns VARCHAR(100),
    prompt_1 VARCHAR(100),
    prompt_1_answer VARCHAR(100),
    prompt_2 VARCHAR(100),
    prompt_2_answer VARCHAR(100),
    prompt_3 VARCHAR(100),
    prompt_3_answer VARCHAR(100),
    phone_number VARCHAR(20),
    push_notifications_enabled BOOLEAN DEFAULT true,
    email_notifications_enabled BOOLEAN DEFAULT true,
    sms_notifications_enabled BOOLEAN DEFAULT false
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    location VARCHAR(200),
    class VARCHAR(100),
    date_and_time TIMESTAMP NOT NULL,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    capacity INTEGER,
    tags TEXT[],
    invited_ids UUID[],
    accepted_ids UUID[],
    declined_ids UUID[],
    invited_count INTEGER DEFAULT 0,
    accepted_count INTEGER DEFAULT 0,
    declined_count INTEGER DEFAULT 0
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

-- Insert sample data into users
-- INSERT INTO users (username, password_hash, email, full_name, major, year, bio, profile_picture_url)
-- VALUES 
-- ('kevinyang123', 'hashedpassword', 'alice@ucsd.edu', 'Kevin Yang', 'Computer Science', 'Senior', 'I love In-N-Out', 'http://132.249.242.182/profile-pictures/innout.png');

-- Insert sample data into events
-- INSERT INTO events (title, description, location, class, date_and_time, creator_id, event_type, status, capacity, tags, invited_ids, accepted_ids, declined_ids, invited_count, accepted_count, declined_count)
-- VALUES 
-- ('CS101 Study Group', 'Study group for CS101: Introduction to Computer Science', 'Room 101, UCSD', 'CS101', '2025-09-15 10:00:00', 
--  '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5', 'In-person', 'Upcoming', 30, ARRAY['CS101', 'Computer Science', 'Quiet'], 
--  ARRAY['2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5'::UUID], ARRAY['2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5'::UUID], ARRAY[]::UUID[], 1, 1, 0);

-- Insert sample data into event_attendees
-- INSERT INTO event_attendees (event_id, user_id, status)
-- VALUES 
-- ('3272c557-e2c8-451b-8114-e9b2d5269d0a', '2e629fee-b5fa-4f18-8a6a-2f3a950ba8f5', 'Accepted');

-- -- Insert sample data into friends
-- INSERT INTO friends (user_id, friend_id, status)
-- VALUES ('user_uuid_1', 'user_uuid_2', 'accepted');

-- Query to see the data in the tables
SELECT * FROM users;
SELECT * FROM events;
SELECT * FROM event_attendees;