# Camera Form Feedback

Real-time exercise form feedback using device camera and pose detection.

## Overview

This application provides real-time exercise form analysis by:

1. Using on-device pose detection to extract body landmarks from the camera feed
2. Sending landmark data (not video) to a backend API
3. Analyzing exercise form using rule-based joint angle calculations
4. Detecting repetitions using a state machine
5. Calculating form scores and providing coaching feedback
6. Saving completed workout sessions for history and statistics

**Currently supported exercise:** Squat

**Planned exercises:** Push-up, Plank, Lunge

## Architecture

```
React Native Camera
        ↓
On-device Pose Detection
        ↓
Body Landmarks (x, y, visibility)
        ↓
Backend REST API
        ↓
Form Analysis (joint angles, rule-based)
        ↓
Rep Detection (state machine)
        ↓
Score + Feedback
        ↓
MongoDB
        ↓
Workout History / Statistics
```

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- REST API

### Mobile
- React Native + Expo
- On-device pose detection
- Expo Camera

## Project Structure

```
camera-form-feedback/
├── backend/          # Express.js REST API
├── mobile/           # React Native Expo app
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The server runs at `http://localhost:7000`

### Environment Variables

See `backend/.env.example` for required variables.

## API Endpoints

### Health Check
- `GET /` — Server status

### Form Feedback
- `POST /api/form-feedback/analyze` — Analyze exercise form
- `GET /api/form-feedback` — Get all form analyses
- `GET /api/form-feedback/:id` — Get specific analysis

### Live Sessions
- `POST /api/live-sessions/start` — Start live workout
- `POST /api/live-sessions/track` — Send landmark frame
- `GET /api/live-sessions/:sessionId` — Get session status
- `POST /api/live-sessions/finish` — Complete workout

### Workout Sessions
- `POST /api/workout-sessions` — Create workout record
- `GET /api/workout-sessions` — Get workout history
- `GET /api/workout-sessions/stats` — Get performance statistics
- `GET /api/workout-sessions/:id` — Get workout details

## Privacy

- Camera processing happens on-device
- Only pose landmark coordinates are sent to the backend
- No video or images are stored
- This is a rule-based prototype, not a medical diagnostic tool

## Disclaimer

This application provides approximate exercise form feedback based on 2D camera pose estimation. It is not a substitute for professional coaching or medical advice. Joint angle thresholds are configurable prototype values, not universal standards.
