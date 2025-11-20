# Cramr

A mobile app for finding and organizing study groups. Basically helps students connect with each other to study together, whether that's in person or virtually. Built with React Native and a Node.js backend.

## Overview

The idea was to make it easier for students to find study partners and organize study sessions. You can browse events on a map or list view, create your own study groups, follow other students, and use some built-in study tools like a Pomodoro timer and flashcards. It's got a social aspect too - you can follow people, see who's going to events, and there's a leaderboard for people who create the most events.

The app runs on iOS, Android, and web through Expo. The backend is a pretty straightforward Express API with PostgreSQL for the database. We use Docker for deployment.

## Features

**Study Groups**
- Browse study events by location, class, date, tags, etc. There's a map view that shows events near you and a list view with filters
- Create events with details like location, time, capacity, whether it's in-person or virtual, and tags
- RSVP to events and see who else is going
- Upload and share study materials with event attendees
- Comment on events

**Social Stuff**
- User profiles with bio, major, year, school, profile pictures, and custom banner colors
- Follow/unfollow other users
- Block users if needed
- Notifications for follows, event invites, RSVPs, etc.
- Direct messaging between users
- Leaderboard showing top event creators
- Search for users by username

**Study Tools**
- Pomodoro timer with work/break cycles and task management
- Ambient noise/music player for focus
- Digital flashcards - create sets and study them
- Notes functionality

**Other Features**
- Two-factor authentication via email OTP
- Password reset flow
- Dark mode support
- Notification preferences (push, email, SMS)
- Profile customization options

## Tech Stack

**Frontend:**
- React Native 0.79.5 with Expo ~53.0.17
- TypeScript
- Expo Router for navigation
- React Native Paper for UI components
- React Native Maps for the map view
- Expo Location for geolocation
- React Native Reanimated for animations
- AsyncStorage for local storage

**Backend:**
- Node.js with Express
- PostgreSQL 17
- bcryptjs for password hashing
- Multer for file uploads (profile pictures, study materials)
- Mailjet for sending emails (2FA codes, password resets, notifications)
- UUID for generating IDs

**Infrastructure:**
- Docker and Docker Compose
- PostgreSQL in a container with persistent volumes
- File storage for uploads

**Testing:**
- Jest for backend tests
- React Native Testing Library for frontend tests
- Supertest for API endpoint testing

The backend API has endpoints for users, events, authentication, notifications, comments, RSVPs, flashcards, file uploads, and a few admin functions. Everything is pretty standard REST API stuff.
