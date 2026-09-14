# Render Deployment Guide (BloomStore backend)

## Docker settings

In Render → Web Service → **Settings**:

- **Dockerfile Path:** `apps/backend/Dockerfile`
- **Docker Context:** `.` (repository root, not `apps/backend`)

Then **Manual Deploy → Clear build cache & deploy**.

Demo logins (created by the seed service when collections are empty):

- Admin: `admin@bloomstore.com` / `Admin123!`
- Customer: `customer@bloomstore.com` / `Customer123!`

## Required environment variables

### Critical

1. **MONGODB_URI** — MongoDB Atlas / replica set connection string.
2. **JWT_SECRET** — at least 32 characters (`openssl rand -base64 32`).

### Recommended

| Key | Default | Notes |
| --- | --- | --- |
| `DB_NAME` | `bloomstore` | Database name |
| `JWT_EXPIRES_IN` | `8h` | Access token TTL |
| `PORT` | set by Render | Nest listens on `process.env.PORT` |
| `NODE_ENV` | `production` | |
| `CORS_ORIGINS` | GitHub Pages origin | Comma-separated whitelist |
| `REDIS_URL` | unset | Optional write-through cache |
| `FRONTEND_URL` | GitHub Pages URL | Used in CORS + docs links |

## How to set variables

1. Open [Render Dashboard](https://dashboard.render.com/)
2. Select the BloomStore backend Web Service
3. **Environment** → **Add Environment Variable**
4. Save — Render redeploys automatically

## Verification

Logs should include:

```
Connecting to MongoDB...
Database: bloomstore
Application is running on: http://localhost:3030/api
```

Health: `GET /api/health`

Docs: `GET /api/docs`

## Troubleshooting

- Missing `MONGODB_URI` / `JWT_SECRET` → process exits on boot.
- Mongo connection failed → allow Render IPs (or `0.0.0.0/0` for a student demo cluster) in Atlas Network Access.
- Transactions (cancel + restock) require a replica set (Atlas provides this).
