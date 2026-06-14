# BK | Premium URL Shortener & Analytics Platform

This project is a part of a hackathon run by https://katomaran.com

BK is a production-ready, interview-grade URL Shortener and click analytics SaaS platform built using the MERN stack (MongoDB Atlas, Express.js, React, Node.js) with Zustand state management and Tailwind CSS styling.

---

## Key Features

1. **Authentication**: Secure registration, login, and robust Access Token (15 mins) & Refresh Token (7 days) session rotation.
2. **URL Shortening**: Nanoid generation, custom alias checks, loopback IP/localhost loop prevention, and validation.
3. **Analytics Tracking**: Asynchronously logs visitor parameters (Operating System, Device Type, Browser, Referrer, Geolocation Country/City, IP Address).
4. **Interactive Dashboard**: Metric counters, search queries, filter states, table sorting, pagination, and edit destination URLs.
5. **QR Code Generator**: Generates high-contrast QR Codes instantly.
6. **Data Exports**: One-click Excel-compatible CSV download of click logs.
7. **Public Stats Page**: Basic public visitor count page.
8. **Dark Mode**: Persistence zinc dashboard theme.

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Zustand, Recharts, React Hot Toast, Lucide React
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Express Validator, Helmet, Morgan, Express Rate Limit
- **Database**: MongoDB Atlas, Mongoose ODM

---

## Folder Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/           # DB & Redis configs
│   │   ├── controllers/      # Route controllers (MVC)
│   │   ├── middleware/       # Auth validation & error handlers
│   │   ├── models/           # Mongoose schemas (User, URL, Visit)
│   │   ├── routes/           # Router groups
│   │   ├── services/         # Business services (Auth, URL, Analytics)
│   │   ├── validators/       # Input body validators
│   │   └── server.js         # Entrypoint
│   └── seed.js               # Database seeding script
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable overlays, modals, skeletons
│   │   ├── store/            # Zustand stores
│   │   ├── services/         # Axios API interceptors
│   │   ├── pages/            # Login, Dashboard, Analytics, Stats
│   │   └── App.jsx           # Main router
└── docker-compose.yml        # Multi-node compose file
```

---

## Local Setup & Installation

### Prerequisite
Ensure you have Node.js (v18+) and MongoDB installed.

### 1. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` configuration file (already initialized with fallback defaults):
   ```bash
   cp .env.example .env
   ```
3. Seed the database with mock users, URLs, and time-series visits:
   ```bash
   npm run seed
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a separate terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
- `PORT`: Express server port (default `5000`)
- `MONGODB_URI`: Connection string (Atlas or local)
- `JWT_ACCESS_SECRET`: Token key for 15-minute access
- `JWT_REFRESH_SECRET`: Token key for 7-day cookies
- `FRONTEND_URL`: URL of the React client (default `http://localhost:5173`)
- `REDIS_URL`: URL of the optional Redis cache (e.g. `redis://localhost:6379`)

---

## Docker Execution

Start the entire stack (Express App, MongoDB database, Redis caching) instantly using Docker Compose:
```bash
docker-compose up --build
```
Access the application at `http://localhost:5000`.

---

## Cloud Deployments

- **Frontend (Vite)**: Optimized for **Vercel** via the included `vercel.json` config containing rewrites for clean single-page routes.
- **Backend (Express)**: Configured for **Render** via the included `render.yaml` infrastructure blueprint.
- **Database (MongoDB)**: Provisioned on **MongoDB Atlas** for high-availability production scaling.

---

## Demo Video Checklist

When showcasing this hackathon app, demonstrate these flows in order:
1. **Unauthenticated visitor**: Try accessing `/dashboard` (verify Auth Guard redirect).
2. **Registration & Login**: Sign up a new user, log in, and notice toast alerts.
3. **URL Creation**: Paste a long URL, configure custom alias, set an expiry date.
4. **Redirection & Analytics logging**:
   - Access the short link in a new incognito window.
   - Return to the dashboard and witness the click counter increment.
5. **Interactive Graphs**: View detailed analytics charts, change browsers/devices, and export visitor click history CSVs.
6. **Dark Mode toggle**: Toggle themes and verify persistence.
