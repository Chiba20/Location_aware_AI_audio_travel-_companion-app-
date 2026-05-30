# CityWhisper

CityWhisper is a location-aware AI audio travel companion for city storytelling, practical traveller services, hidden gems, walks, premium access, and feedback collection.

The app is built as a React/Vite frontend with a Flask API backend. City content is served from local JSON data, while premium users are stored in PostgreSQL when `DATABASE_URL` is configured.

## Features

- City discovery with image slideshows and interest-based exploration
- Location-aware place storytelling and arrival checks
- Walking routes and journey tracking
- Premium-only Hidden Gems and Traveller Services
- Premium registration and login backed by PostgreSQL
- Optional premium registration confirmation emails through SMTP
- Optional AI story generation through `OPENAI_API_KEY`
- Traveller feedback submission and listing
- Render-ready frontend and backend deployment setup

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, Lucide React |
| Backend | Python, Flask, Flask-CORS, Gunicorn |
| Database | PostgreSQL for premium users |
| Data source | JSON files for cities, places, walks, journeys, and feedback |
| Email | SMTP provider such as Gmail, SendGrid, Brevo, Mailgun, or Resend |
| Audio | Edge TTS-generated MP3 narration files |
| Deployment | Render Web Service + Render Static Site + Render PostgreSQL |

## Project Structure

```text
client/                 React/Vite frontend
client/public/audio/    Generated audio narration files
server/                 Flask backend API
server/data/            JSON content used by the backend
server/routes/          Flask API route modules
server/utils/db.py      PostgreSQL connection and premium table setup
scripts/                Utility scripts, including audio generation
requirements.txt        Python backend dependencies
runtime.txt             Render Python runtime version
Procfile                Gunicorn start command for deployment
```

## Local Setup

### 1. Backend

Create and activate a virtual environment, then install dependencies:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the Flask API:

```powershell
python server\app.py
```

Local backend URL:

```text 
http://127.0.0.1:5000/api
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

### 2. Frontend

Install dependencies and start Vite:

```powershell
cd client
npm install
npm run dev
```

Local frontend URL:

```text
http://127.0.0.1:5173
```

For local development, the frontend can use `/api` as the default API base. For deployed frontend builds, set `VITE_API_BASE_URL` to the deployed backend API URL.

## Environment Variables

### Backend

Set these on the backend service:

```text
PORT=5000
DEBUG=False
DATABASE_URL=postgresql://...
```

Optional SMTP email settings:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-app-email@gmail.com
SMTP_PASSWORD=your-email-app-password
SMTP_FROM_EMAIL=your-app-email@gmail.com
```

Optional AI story generation:

```text
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is not set, the backend falls back to generated stories from saved place facts.

### Frontend

Set this on the frontend static site:

```text
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

Example:

```text
VITE_API_BASE_URL=https://every-streets-backend.onrender.com/api
```

## Database

The production premium system uses PostgreSQL through `DATABASE_URL`.

When the backend starts and `DATABASE_URL` exists, it automatically creates this table if needed:

```text
premium_users
```

The table stores premium registration details, hashed passwords, payment reference, premium status, and timestamps.

If `DATABASE_URL` is missing, premium registration/login endpoints return:

```text
Premium database is not configured yet.
```

## API Overview

Base URL:

```text
/api
```

Important endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/cities/` | List cities |
| GET | `/cities/:id` | Get one city |
| GET | `/places/` | List/filter places |
| POST | `/places/:id/arrival` | Check location arrival |
| GET | `/walks/` | List walks |
| POST | `/journeys/start` | Start journey |
| PATCH | `/journeys/:id/location` | Update journey location |
| POST | `/journeys/:id/end` | End journey |
| GET | `/feedback/` | List feedback |
| POST | `/feedback/` | Submit feedback |
| POST | `/premium/register` | Register premium user |
| POST | `/premium/login` | Login premium user |
| POST | `/premium/confirmation-email` | Send premium confirmation email |
| POST | `/ai/personalized-story` | Generate story |

## Deployment on Render

### Backend Web Service

Create a Render Web Service connected to this repository.

Recommended settings:

```text
Language: Python 3
Branch: main
Root Directory: leave empty
Build Command: pip install -r requirements.txt
Start Command: gunicorn "server.app:create_app()" --bind 0.0.0.0:$PORT
```

Required backend environment variables:

```text
DEBUG=False
DATABASE_URL=<Render PostgreSQL Internal Database URL>
```

Optional backend environment variables:

```text
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM_EMAIL
OPENAI_API_KEY
OPENAI_MODEL
```

### Frontend Static Site

Create a Render Static Site connected to the same repository.

Recommended settings:

```text
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

Required frontend environment variable:

```text
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

For React Router refresh support, add this Render rewrite rule on the frontend static site:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## Audio Generation

Narration scripts live in:

```text
server/data/audio_narrations.json
```

Generated MP3 files are saved in:

```text
client/public/audio/
```

Generate missing audio files:

```powershell
pip install -r requirements.txt
python scripts\generate_audio.py
```

The generator uses the Indian English `en-IN-NeerjaNeural` voice and skips existing MP3 files. To regenerate every audio file with Edge TTS:

```powershell
python scripts\generate_audio.py --force
```

## Useful Commands

Frontend build:

```powershell
cd client
npm run build
```

Backend syntax check:

```powershell
python -m py_compile server\routes\premium_routes.py
```

Git deploy flow:

```powershell
git add .
git commit -m "Describe your change"
git push
```

## Notes

- Do not commit real secrets, database URLs, SMTP passwords, or API keys.
- Use a separate app email account or a transactional email provider for SMTP.
- Use a Gmail App Password if Gmail is used for SMTP.
- The frontend must point to the backend `/api` URL in production.
- PostgreSQL is required for real premium registration across devices.
