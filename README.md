
# 🌍 VIBEMAP — **Real-time Mood Mapping Platform**

> Social vibes meet interactive maps. Drop your emotion, discover your friends, visualize your world.

Made by student, for students
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

## 🧪 PROJECT STRUCTURE

```
vibemap/
├── docker-compose.yml       # (optional)
├── Dockerfile               # if extending Docker
├── .env                     # local variables (token secret, etc.)
├── package.json             # PNPM/Next config
├── prisma/                  # (if you switch to Prisma later)
├── public/                  # images, static assets
├── src/
│   ├── app/
│   │   ├── page.tsx         # Main Leaflet page
│   │   ├── login/           # Login UI
│   │   └── register/        # Register UI
│   ├── components/
│   │   ├── map/             # Map, Markers, Emoji Picker
│   │   ├── auth/            # LoginModal, RegisterModal
│   │   ├── profile/         # ProfileModal
│   │   └── settings/        # SettingsModal
│   ├── context/
│   │   └── AuthContext.tsx  # Custom JWT + token logic
│   ├── lib/
│   │   └── api.ts           # All fetch + auth utils
│   └── styles/              # CSS modules
└── server/                  # Express backend
    ├── routes/              # /auth, /profile, /visits
    ├── middleware/          # JWT check
    └── index.js             # Entry point
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

## 🧑‍💻 HOW TO RUN LOCALLY

### 🔧 1. MongoDB with Docker

```bash
docker run -d --name vibemap-mongo -p 27017:27017 mongo
```

### 🔧 2. Backend (Express)

```bash
cd server
pnpm install
pnpm dev
```

### 🔧 3. Frontend (Next.js)

```bash
cd vibemap
pnpm install
pnpm dev
```

### 🔧 4. dev:all

```bash
pnpm dev:all
```
### 🔧 5. Dev start!
```bash
# Запуск полной системы активных вайбов
pnpm dev:vibes

# Остановка всего
pnpm stop:all

# Полная перезагрузка
pnpm dev:clean
```

Open frontend:
📡 [http://localhost:3000](http://localhost:3000)

Open backend (API):
🧠 [http://localhost:5000](http://localhost:5000)

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
