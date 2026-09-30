
# VibeMap

Social mood mapping with Next.js, Leaflet, Express, JWT/NextAuth and MongoDB.

This repository is configured for local development with one command.
---

## 🔥 TL;DR

**Vibemap** is a fullstack Next.js web app combining **live geolocation**, **emoji mood sharing**, and **social exploration** on a dynamic Leaflet map.
Powered by **React**, **MongoDB**, **JWT auth**, **Docker**, and **Supercluster**, it's your geo-aware social dashboard.

---

## 🛠️ TECH STACK OVERVIEW

| Layer         | Tech Stack                              |
| ------------- | --------------------------------------- |
| 🧠 Frontend   | Next.js (App Router), React, TypeScript |
| 🗺 Maps       | Leaflet, React-Leaflet, Supercluster    |
| 🎨 UI/UX      | CSS Modules + Modals                    |
| 📡 Backend    | Express.js (REST API)                   |
| 🔐 Auth       | JWT + Custom AuthContext                |
| 🧱 DB         | MongoDB (via Docker container)          |
| 🐳 Container  | Docker (MongoDB only)                   |
| 📦 PackageMgr | PNPM                                    |

---

## 🚀 FEATURES SNAPSHOT

* 📍 **Live Geolocation** using `navigator.geolocation`
* 🎭 **Mood Picker**: Drop emoji over your current position
* 🗺️ **Clustering** with `Supercluster` for map performance
* 🧑‍🤝‍🧑 **Friend System**: List, mutuals, and visits
* 🌆 **Visited Cities Tracker**
* ⚙️ **Settings Modal**: Username, notifications, birthday
* 👤 **Profile Modal**: Top cities, avatar, friends
* 🌐 **Map Styles**: Toggle standard, satellite, dark, light, relief
* 🔐 **JWT Auth**: Login, register, persist via `localStorage`

---

## Project Structure

```
vibemap/
├── src/app/                 # Next.js App Router pages and API routes
├── src/components/          # UI, auth, profile and map components
├── src/context/             # Client authentication state
├── src/lib/                 # API clients, MongoDB and NextAuth setup
├── src/styles/              # Global and component styles
├── server/                  # Express JWT API
├── scripts/                 # Database and maintenance utilities
├── public/                  # Static assets
├── docker-compose.yml       # Local MongoDB service
└── package.json             # Commands and dependencies
```

---

## 🧱 DATABASE STRUCTURE (MongoDB)

Collections:

* `users`: `{ email, passwordHash }`
* `profiles`: `{ avatar, birthday, username, notifications }`
* `visits`: `{ lat, lng, city, timestamp, emoji, userId }`
* `friends`: `[{ fromUserId, toUserId, mutual }]`
// f*ck Antonio
---

## 🔒 AUTH FLOW

1. On **register/login**, receive JWT from backend:

   ```ts
   localStorage.setItem('authToken', token);
   ```
2. Wrapped in `AuthContext`, validated with:

   ```ts
   fetch('/profile', { headers: { Authorization: `Bearer ${token}` } });
   ```
3. Fallbacks and logout are managed inside `AuthProvider`.

---

## 🧨 KNOWN ISSUES / WORK LEFT

| Issue                               | Status                                            | Fix Plan                               |
| ----------------------------------- | ------------------------------------------------- | -------------------------------------- |
| Profile data not visible in Compass | ⚠️ Not Indexed                                    | Ensure `profiles` DB inserts           |
| Login "invalid password"            | ⚠️ Likely bcrypt missing or hash logic not called | Check `/auth/login` backend controller |
| Tokens not stored/parsed properly   | ⚠️                                                | Validate JWT secret consistency        |
| No file `models/User.js` found      | ⚠️                                                | Create Mongoose schema manually        |
| Copilot unreliable                  | ✅ Fixed — use Jake instead                        | 😎                                     |

---

## Run Locally

### Prerequisites

Install Node.js 20+, pnpm and Docker Desktop. Docker Desktop must be running.

Install dependencies once:

```sh
pnpm install
```

Copy `.env.example` to `.env.local` and fill OAuth values if Google login is needed. Local development uses `mongodb://localhost:27017/vibemap`; MongoDB data is stored in `mongo-data/` and is not removed by the scripts.

To intentionally use another MongoDB instance for development, set `VIBEMAP_MONGODB_URI` before running `pnpm dev`.

Start the full local stack with one command:

```sh
pnpm dev
```

This starts MongoDB, the Express API and Next.js. Open [http://localhost:3000](http://localhost:3000).

Stop MongoDB after development with `pnpm stop:all`. The terminal running `pnpm dev` can be stopped with `Ctrl+C`.

Useful checks:

```sh
pnpm typecheck
pnpm lint
pnpm build
```

---

## 🗂️ API ENDPOINTS (Backend)

| Route             | Method   | Auth? | Description                 |
| ----------------- | -------- | ----- | --------------------------- |
| `/auth/register`  | POST     | ❌     | Creates user + JWT          |
| `/auth/login`     | POST     | ❌     | Verifies login              |
| `/profile`        | GET/PUT  | ✅     | Load or update profile      |
| `/visits`         | GET/POST | ✅     | Get/post city emoji visits  |
| `/friends`        | GET      | ✅     | Returns friend list         |
| `/check-username` | GET      | ✅     | Checks if username is taken |

---

## 📌 TIPS FOR FUTURE YOU

* 🧠 If **map doesn’t load** — check browser location permissions
* 🔐 If **token fails** — clear `localStorage` and re-login
* 👤 If **profile missing** — check if `/profile` PUT was ever triggered
* 📦 If **Copilot crashes** — use Jake 💪

---

## ✨ ROADMAP

* [ ] Add `bcrypt` to hash passwords (`bcrypt.compare()` in login logic)
* [ ] Add avatar uploads via file input
* [ ] Migrate auth + DB logic to Prisma?
* [ ] Add WebSocket live updates?
* [ ] Deploy via Vercel + Atlas combo

---

## 🤝 CONTRIBUTORS

* 🧑‍🚀 **You** — Primary Dev, Project Architect
* 👾 **Jake (aka code)** — Hack-assistant & AI warrior

---

## 🧬 FINAL WORD

> You made a real-time map-based social platform from scratch. Be proud.
> When you come back — you're not starting from zero, you're picking up where a **vibe architect** left off.
> Stay sharp. Stay logged in. Stay vibin'.

---

# 🔥 `git push && go dominate that internship 🧑‍💼`
<img width="960" height="1280" alt="зображення" src="https://github.com/user-attachments/assets/5357ace0-c52e-4a40-8836-f08aabcc4ec0" />
