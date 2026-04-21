# Frontend

React.js frontend for Every Street.

## Commands

```powershell
npm install
npm run dev
npm run build
```

## Environment

Create `client/.env` from `.env.example` when the backend is not served through the Vite proxy:

```text
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

## Pages

- `/` app dashboard
- `/cities` city discovery
- `/city/:id` city detail
- `/journey` location-trigger journey tester
- `/feedback` feedback form and review list
