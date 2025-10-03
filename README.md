# Scalable Web App — Auth + Dashboard

## Overview
React + Vite frontend, Node + Express backend, MongoDB (Atlas/local). Features: JWT auth, Notes CRUD, search, profile, validations.

## Tech
- Frontend: React (Vite), Tailwind, axios, react-hook-form
- Backend: Node, Express, Mongoose
- DB: MongoDB (Atlas recommended)
- Tests: Jest, Supertest, MongoDB Memory Server

## Local Setup

### Backend
1. `cd backend`
2. Copy `.env.example` → `.env` and fill:

MONGO_URI=...
JWT_SECRET=...
PORT=4000
FRONTEND_URL=http://localhost:5173

3. Install dependencies: `npm install`
4. Start in dev: `npm run dev`
5. Run tests: `npm test`

### Frontend
1. `cd frontend`
2. Copy `.env.example` → `.env` and fill:
VITE_API_URL=http://localhost:4000/api
3. Install deps: `npm install`
4. Start dev: `npm run dev`

## API Endpoints
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login user
- `GET /api/profile/me` — get profile (auth)
- `PUT /api/profile` — update profile (auth)
- `GET /api/notes?q=&page=&limit=&sort=` — list notes (auth)
- `POST /api/notes` — create note (auth)
- `GET /api/notes/:id` — get note (auth)
- `PUT /api/notes/:id` — update (auth)
- `DELETE /api/notes/:id` — delete (auth)

## Deployment
- Backend: Render / Railway — set `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` as environment variables.
- Frontend: Vercel — set `VITE_API_URL` to backend URL (e.g. `https://your-backend.onrender.com/api`).

## Security Notes
- Passwords stored hashed with bcrypt.
- JWT short-lived; consider using refresh tokens.
- Rate limiting on auth endpoints.
- Use HTTPS and secure cookies in production.
