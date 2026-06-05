# ReevoAI — Review-to-Marketing Automations

Turn customer reviews into AI-generated social content and manage publishing from one dashboard.

## Project structure

```
reviewai-automations/
├── backend/                 # Node.js API (Express + MongoDB)
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── app.ts           # Express app
│   │   ├── config/          # Environment
│   │   ├── db/              # MongoDB connection
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── services/        # Gemini AI, seed data
│   │   ├── lib/             # JWT, passwords
│   │   ├── utils/           # Helpers
│   │   └── types/
│   ├── package.json
│   └── .env.example
├── src/                     # Frontend (TanStack Start + React)
│   ├── routes/              # Pages (app tabs, login, landing)
│   ├── components/
│   └── lib/                 # API client, auth context
└── package.json             # Frontend scripts & deps
```

## Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Frontend | TanStack Start, React, Tailwind           |
| Backend  | Express, Mongoose, MongoDB                |
| AI       | Google Gemini (fallback templates without key) |

## Prerequisites

- **Node.js** 20+
- **MongoDB** running locally or Atlas URI

```bash
# macOS (Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Or Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

## Quick start

### 1. Install

```bash
npm install
```

This installs frontend deps and runs `postinstall` for `backend/`.

### 2. Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` — at minimum set `MONGODB_URI` and optionally `GEMINI_API_KEY`.

### 3. Run

**One command (API + frontend):**

```bash
npm run dev:all
```

Or two terminals:

```bash
npm run dev:api   # Terminal A — port 3001
npm run dev       # Terminal B — port 5173
```

**If login or API calls hang silently**, a stuck process is probably holding port 3001:

```bash
npm run kill:api
npm run dev:api
```

Then refresh the browser. The login page shows a green/red API status banner.

### 4. Sign in

[http://localhost:5173/login](http://localhost:5173/login)

| Email              | Password   |
| ------------------ | ---------- |
| `demo@reevoai.com` | `demo1234` |

Demo data is seeded automatically on first API start when that user does not exist.

## App routes

| Route              | Description                    |
| ------------------ | ------------------------------ |
| `/app`             | Dashboard                      |
| `/app/reviews`     | Reviews inbox, **review link**, AI actions |
| `/r/:token`        | Public customer review form (with photos) |
| `/app/ai-content`  | Gemini content studio          |
| `/app/publishing`  | Post queue                     |
| `/app/analytics`   | Metrics                        |
| `/app/settings`    | Brand & channels               |

## API

Base URL: `http://127.0.0.1:3001/api`

```bash
curl http://127.0.0.1:3001/api/health
```

Health response includes `mongodb: true` when the database is connected.

## Customer review link (with images)

1. Sign in and open **Reviews**
2. Copy the **Customer review link** (e.g. `http://localhost:8080/r/abc123…`)
3. Share it with customers — they can submit a star rating, text, and up to **5 photos**
4. New reviews appear in your inbox with source **Review Link**

Set `PUBLIC_APP_URL` in `backend/.env` to your frontend URL (e.g. `http://localhost:8080`).

## Backend-only commands

```bash
cd backend
npm run dev        # watch mode
npm run typecheck
```
