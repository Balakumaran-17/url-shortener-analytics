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

# Local Setup & Installation

## Prerequisites

### Option 1: Docker (Recommended)

Ensure Docker and Docker Compose are installed.

Start only the database and cache services:

```bash
docker compose up -d mongodb redis
```

This will launch MongoDB and Redis containers while keeping port 5000 available for the local Node.js backend.

### Option 2: Local Installation

Ensure the following are installed:

* Node.js v18+
* MongoDB
* Redis (optional)

---

## Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create environment configuration:

```bash
cp .env.example .env
```

Seed the database with sample users, URLs, analytics, and visit history:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install
```

Start the React application:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Docker Recovery Note

If you previously executed:

```bash
docker compose down
```

all containers including MongoDB will stop.

Restart only the required services:

```bash
docker compose up -d mongodb redis
```

Then restart the backend:

```bash
npm run dev
```

The backend will reconnect successfully to MongoDB and Redis.

---

## Default Development URLs

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
MongoDB:  mongodb://localhost:27017
Redis:    redis://localhost:6379
```


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

## Demo Login Credentials

Use the following credentials for testing:

Email: demo@example.com # Multiple sample short links are already available in the dashboard after login for testing and evaluation.
Password:password123

Email:new@user.com # new user
Password:user123

Note: These are sample credentials created only for evaluation purposes.

# URL Shortener & Analytics Platform

## Demo Video
1.Backend demo vedio:
  https://www.loom.com/share/0330def311584b6d9e140059de712c03
2.Frontend demo vedio:
  https://www.loom.com/share/f2e58165dce6476cbe36d1cbd5e2f556
