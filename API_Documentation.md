# API Reference Documentation

This document describes the request/response contracts, authorization headers, validation structures, and error codes for the URL Shortener & Analytics platform.

---

## 1. Global JSON Response Envelopes

All API responses follow a unified structure.

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": {
    "key": "value"
  }
}
```

### Error Response (HTTP 400/401/403/429/500)
```json
{
  "success": false,
  "message": "Error description message",
  "error": {
    "field": "Validation message",
    "stack": "Stack trace description (omitted in production)"
  }
}
```

---

## 2. Authentication Route Paths (`/api/v1/auth`)

### A. Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Rate Limit**: 10 requests / hour
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "647248bc8f921f001cda8b1a",
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  }
  ```

### B. User Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Rate Limit**: 5 requests / 15 minutes
- **Request Body**:
  ```json
  {
    "email": "demo@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (Sets HTTP cookie `refreshToken`)
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "647248bc8f921f001cda8b1a",
        "username": "demouser",
        "email": "demo@example.com"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### C. Rotate Tokens (Refresh)
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh`
- **Request Body** (Optional if `refreshToken` cookie is transmitted):
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response**: `200 OK` (Resets HTTP cookie `refreshToken`)
  ```json
  {
    "success": true,
    "message": "Token rotated successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### D. Logout Session
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `200 OK` (Clears cookies)
  ```json
  {
    "success": true,
    "message": "Logout successful"
  }
  ```

---

## 3. URL Management Paths (`/api/v1/urls`)

All routes in this group require the header `Authorization: Bearer <accessToken>`.

### A. Shorten Link
- **Method**: `POST`
- **Path**: `/api/v1/urls`
- **Rate Limit**: 100 requests / hour
- **Request Body**:
  ```json
  {
    "longUrl": "https://github.com/facebook/react",
    "customAlias": "react-repo",
    "expiresAt": "2026-12-31T23:59:59Z"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "URL shortened successfully",
    "data": {
      "url": {
        "_id": "64724a108f921f001cda8b21",
        "userId": "647248bc8f921f001cda8b1a",
        "longUrl": "https://github.com/facebook/react",
        "shortCode": "react-repo",
        "customAlias": "react-repo",
        "clicks": 0,
        "qrCode": "data:image/png;base64,iVBORw0KGgo...",
        "status": "active",
        "expiresAt": "2026-12-31T23:59:59.000Z",
        "createdAt": "2026-06-13T22:42:37.000Z",
        "updatedAt": "2026-06-13T22:42:37.000Z"
      }
    }
  }
  ```

### B. List User URLs
- **Method**: `GET`
- **Path**: `/api/v1/urls`
- **Query Parameters**:
  - `page`: default `1`
  - `limit`: default `10`
  - `search`: filters on destination or shortCode
  - `status`: filters by `active`, `inactive`, `expired`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "URLs retrieved successfully",
    "data": {
      "urls": [ ... ],
      "totalCount": 15,
      "totalPages": 2,
      "currentPage": 1
    }
  }
  ```

### C. Edit Destination URL
- **Method**: `PUT`
- **Path**: `/api/v1/urls/:id`
- **Request Body**:
  ```json
  {
    "longUrl": "https://github.com/facebook/react/releases",
    "expiresAt": null
  }
  ```
- **Response**: `200 OK`

---

## 4. Analytics Paths (`/api/v1/analytics`)

### A. Dashboard Overview Summary
- **Method**: `GET`
- **Path**: `/api/v1/analytics/dashboard`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Dashboard summary stats retrieved",
    "data": {
      "cards": {
        "totalLinks": 5,
        "totalClicks": 506,
        "activeLinks": 4,
        "clicksToday": 18
      },
      "dailyClicks": [
        { "date": "2026-06-07", "clicks": 80 },
        { "date": "2026-06-08", "clicks": 45 },
        ...
      ],
      "topLinks": [ ... ],
      "browserStats": [
        { "name": "Chrome", "value": 310 },
        { "name": "Safari", "value": 115 }
      ],
      "deviceStats": [
        { "name": "Desktop", "value": 380 },
        { "name": "Mobile", "value": 126 }
      ]
    }
  }
  ```

### B. Detailed Link Stats
- **Method**: `GET`
- **Path**: `/api/v1/analytics/url/:id`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `200 OK` (yields 30-day click arrays, device/os lists, paginated visitor tables)

### C. Public Link Stats
- **Method**: `GET`
- **Path**: `/api/v1/analytics/public/:shortCode`
- **Response**: `200 OK` (unauthenticated endpoint, returns count of clicks only)
  ```json
  {
    "success": true,
    "message": "Public URL statistics retrieved",
    "data": {
      "clicks": 145,
      "createdAt": "2026-06-12T12:00:00.000Z",
      "status": "active",
      "expiresAt": null
    }
  }
  ```
