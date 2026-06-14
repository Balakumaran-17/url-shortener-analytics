# Architecture Documentation

This document explains the technical architecture, database schemas, flowcharts, and design principles implemented in the URL Shortener & Analytics platform.

---

## 1. High-Level System Architecture

The application is structured as a decoupled monorepo containing a React frontend client and an Express.js backend API server. In production, they can be deployed separately or packaged together inside a single Docker container.

```mermaid
graph TD
    Client[React/Vite Client] -- "JSON API requests" --> ExpressServer[Express.js Server]
    ExpressServer -- "Mongoose ODM" --> MongoDB[MongoDB Atlas Database]
    ExpressServer -- "Cache (Optional)" --> Redis[Redis Cache Cluster]
    Client -- "Direct Redirect Link" --> ShortCodeRoute[/:shortCode]
    ShortCodeRoute -- "Capture user-agent, geo, referrer" --> ExpressServer
```

---

## 2. Low-Level Module Design (Backend)

The backend follows the MVC (Model-View-Controller) design pattern and incorporates a business logic Service Layer to thin out controllers:

- **Routes**: Define paths, rate limiters, validation middlewares, and bind request context to controllers.
- **Controllers**: Parse input arguments, call appropriate services, and output standardized responses (`sendSuccess` / `sendError`).
- **Services**: Centralize core business rules:
  - `AuthService`: Password hashing, session creation, token rotation.
  - `UrlService`: URL formatting validations, custom alias checks, unique short code creation, QR Code generation.
  - `AnalyticsService`: User Agent parsing, IP-to-Geo resolutions, visit logging, timeseries analytics aggregations.
- **Models**: Define Mongo schemas with Mongoose and define optimal database indices.

---

## 3. Core Operational Flows

### A. JWT Authentication & Refresh Token Rotation

To ensure high security without forcing users to re-login frequently, we implement Token Rotation:
1. When logging in, the server issues an **Access Token** (expires in 15 mins) in the JSON body, and a **Refresh Token** (expires in 7 days) inside a secure `httpOnly` cookie.
2. The client attaches the Access Token to the `Authorization` header of all requests.
3. When the Access Token expires, the client's Axios Interceptor catches the `401 Unauthorized` response, issues a `POST /api/v1/auth/refresh` request (transmitting the refresh cookie), receives a new token pair, and replays the original failed request.

```mermaid
sequenceDiagram
    participant User as React Frontend
    participant Server as Express Backend
    participant DB as MongoDB Atlas

    User->>Server: POST /auth/login
    Server->>DB: Verify email & hashed password
    DB-->>Server: User found
    Server->>Server: Generate Access (15m) & Refresh (7d)
    Server->>DB: Store active refresh token
    Server-->>User: Return Access Token + Set Refresh Cookie
    Note over User,Server: 15 minutes pass (Access Token expires)
    User->>Server: GET /urls (expired access token)
    Server-->>User: 401 Unauthorized
    User->>Server: POST /auth/refresh (sends cookie)
    Server->>DB: Verify cookie matches stored token
    Server->>Server: Generate new Access & Refresh tokens
    Server->>DB: Rotate stored refresh token
    Server-->>User: Return new Access Token + Set new Cookie
    User->>Server: GET /urls (replayed request)
    Server-->>User: 200 OK
```

### B. URL Redirection & Analytics Capture Flow

Redirections must execute instantly. Visitor logging runs asynchronously in the background.

```mermaid
sequenceDiagram
    participant Guest as Web Visitor
    participant Server as Redirect Route (/:shortCode)
    participant DB as MongoDB / Analytics
    participant Target as Destination URL

    Guest->>Server: GET /react-repo
    Server->>DB: Query Url model by shortCode
    DB-->>Server: Return Url document (active)
    Server->>Server: Extract User-Agent, Referrer, and IP Geolocation
    Server-->>Guest: HTTP 302 Redirect (Location: github.com)
    Note over Guest,Target: Visitor reaches target website
    Server->>DB: Record Visit log & increment Url clicks count (Async)
```

---

## 4. Database Schema Relationships

```mermaid
erDiagram
    USER {
        ObjectId id PK
        string username
        string email UK
        string password
        string refreshToken
        date createdAt
        date updatedAt
      }
    URL {
        ObjectId id PK
        ObjectId userId FK
        string longUrl
        string shortCode UK
        string customAlias UK
        int clicks
        string qrCode
        string status
        date expiresAt
        date deletedAt
        date createdAt
        date updatedAt
    }
    VISIT {
        ObjectId id PK
        ObjectId urlId FK
        date timestamp
        string browser
        string device
        string os
        string referrer
        string country
        string city
        date createdAt
        date updatedAt
    }

    USER ||--o{ URL : creates
    URL ||--o{ VISIT : receives
```

---

## 5. Security Measures

1. **Password Protection**: Hashing using `bcryptjs` with 10 salt rounds.
2. **HTTP Header Protection**: Integrated `helmet` middleware.
3. **CORS Configuration**: Restricts origin requests to authorized host domains.
4. **Rate Limiting**: Custom limits prevent login brute-forcing and URL creations loops.
5. **Database Auditing**: Automatically tracks mutations with `timestamps: true` audits.
6. **Soft Deletions**: Protects database referential integrity by flagging deleted links instead of erasing database rows.
7. **Destination Loop Protection**: Filters out localhost loopbacks, internal subnet IPs, and non-HTTP/HTTPS protocols.
