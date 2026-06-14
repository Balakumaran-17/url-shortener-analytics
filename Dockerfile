# ========================================================
# Stage 1: Build the React frontend
# ========================================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ========================================================
# Stage 2: Serve backend and static assets
# ========================================================
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy backend dependencies configuration
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source code
COPY backend/src ./backend/src

# Copy built frontend assets to backend's public dir
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Expose server port
EXPOSE 5000

# Run Express server
CMD ["node", "backend/src/server.js"]
