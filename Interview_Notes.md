# Hackathon / Technical Interview Notes

This document provides a concise summary of the key architectural implementations, design patterns, and engineering trade-offs of the platform. It is structured to help you ace your senior software engineering review.

---

## 1. Authentication & Session Security Flow

Our auth system is designed around standard web security patterns:
- **Registration**: We enforce strict format checks via `express-validator` (alphanumeric username, valid email, minimum password lengths). Passwords are cryptographically hashed using `bcryptjs` with 10 salt rounds before saving.
- **Session Tokens**: We use JWT (JSON Web Tokens). When a user logs in, we generate:
  1. An **Access Token** containing the user's ID, username, and email. Signed with `JWT_ACCESS_SECRET`. Lifetime: **15 minutes**.
  2. A **Refresh Token** containing only the user's ID. Signed with `JWT_REFRESH_SECRET`. Lifetime: **7 days**.
- **Delivery**: The access token is sent in the JSON body. The refresh token is transmitted in an `httpOnly`, secure (in production), and `sameSite: 'strict'` cookie. This shields the refresh token from cross-site scripting (XSS) attacks.

---

## 2. Refresh Token Rotation (Token Rotation)

To mitigate token theft, we implement strict Refresh Token Rotation:
- Every time the client requests a new access token (using the refresh token at `/api/v1/auth/refresh`), the server rotates the refresh token.
- The server invalidates the old refresh token in the database, issues a new refresh token, and sets the updated cookie.
- If a leaked refresh token is reused by a malicious agent, the server detects a mismatch between the cookie and the active DB token, revokes the user's entire session, and forces a logout. This prevents replay attacks.

---

## 3. URL Short Code & QR Code Generation Logic

- **Code Generation**: We utilize `nanoid` (v3) to generate 7-character random, URL-friendly unique strings (e.g. `tw-css`). This offers a keyspace of $64^7 \approx 4.4$ trillion possible codes, making collisions highly improbable. We implement a collision-retry loop (up to 5 attempts) to guarantee uniqueness.
- **Custom Aliases**: Users can supply a custom slug. The server validates the format to ensure it is alphanumeric and checks the database to prevent duplicate collisions.
- **URL Health Validation**: Before shortening, the server parses the URL using the native `URL` API:
  - Validates correct formatting and checks for protocols (`http:` and `https:` only).
  - Prevents internal loops by rejecting localhost/loopback addresses (`127.0.0.1`, `::1`, `localhost`).
  - Blocks access to internal private subnets (`10.x.x.x`, `192.168.x.x`, `172.16.x.x`-`172.31.x.x`) to prevent Server-Side Request Forgery (SSRF).
- **QR Codes**: We generate high-contrast base64-encoded PNG data URLs using the `qrcode` library on the backend, pointing directly to our redirection URL.

---

## 4. Real-time Analytics Logging Flow

Analytics tracking must be lightning-fast and must not block the guest redirect experience.
- When a user visits `/:shortCode`, the server fetches the URL configuration. If valid and not expired, the server instantly issues a **HTTP 302 Found** redirect header to send the visitor to their destination.
- Simultaneously, the server records the click data **asynchronously** in the background:
  - **User-Agent**: Parsed using `ua-parser-js` to extract device type (Desktop, Mobile, Tablet), operating system, and browser engine.
  - **Referrer**: The HTTP `Referer` header is parsed and categorized (Direct, Google, Twitter, LinkedIn, etc.).
  - **IP Geolocation**: The visitor's IP is parsed. For local demos, we hash the client's IP to return a realistic country/city from a static distribution, ensuring beautiful charts. For production, we resolve the IP against standard geographic headers.
  - **Click Counter**: Increments the click counter on the URL collection directly.

---

## 5. Database Schema & Index Optimization

We use MongoDB and Mongoose. Our database schemas are optimized for quick lookup and analytics scaling:
- **User Schema**: Indexed on `email` (unique).
- **URL Schema**: Indexed on `shortCode` (unique) and `customAlias` (unique, sparse). We also created a compound index `{ userId: 1, deletedAt: 1, createdAt: -1 }` to accelerate dashboard views when rendering user URLs sorted by date.
- **Visit Schema**: Indexed on `urlId` and timestamp to optimize time-series queries.
- **Soft Deletion**: We utilize a `deletedAt: Date` field. The dashboard queries ignore URLs where `deletedAt !== null`. This keeps links recoverable and preserves historical analytics data without breaking referential integrity.

---

## 6. Performance & Scale Optimizations

1. **Service Layer Separation**: Business rules are written in services (`AuthService`, `UrlService`, etc.), keeping controllers extremely lean. This simplifies testing and allows modular extensions (such as integrating Redis caching in the future).
2. **Database Pagination**: We avoid pulling entire collections. The URL table uses Mongoose `skip` and `limit` pagination.
3. **Zustand State Stores**: Frontend states (auth, urls, analytics, theme) are isolated in Zustand stores, preventing unnecessary React component re-renders.
4. **Single-Origin Docker Package**: We configure a multi-stage Dockerfile that builds the React project and places the compiled assets in the Express backend `public/` directory. This serves the entire application from a single port, eliminating CORS complications in production.
