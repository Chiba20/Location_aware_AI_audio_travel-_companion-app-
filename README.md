# Every Street

Location-aware AI audio travel companion app for city storytelling, hidden gems, walking routes, journey tracking, and traveller feedback.

## Project Structure

```text
client/              React.js frontend
server/              Flask backend API
server/data/         JSON data used by current backend
server/database/     MySQL schema and seed files
docker-compose.yml   MySQL and phpMyAdmin services
```

## Backend

Install Python dependencies:

```powershell
pip install -r requirements.txt
```

Run the Flask API:

```powershell
python server\app.py
```

Backend URL:

```text
http://127.0.0.1:5000/api
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

## Frontend

Install Node.js first if `npm` is not available.

Run the React app:

```powershell
cd client
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

Optional frontend environment file:

```powershell
copy .env.example .env
```

## MySQL

Import manually:

```powershell
cd server\database
mysql -u root -p < init.sql
```

Or start MySQL and phpMyAdmin with Docker:

```powershell
docker compose up -d
```

phpMyAdmin:

```text
http://127.0.0.1:8080
```

## Main Features

- Browse cities and interests
- View city stories, audio places, hidden gems, and walks
- Start a journey with interests and narration style
- Test location-aware story triggers
- Submit and view traveller feedback
- MySQL schema ready for migration from JSON storage
