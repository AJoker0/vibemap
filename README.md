
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
<img width="960" height="1280" alt="зображення" src="https://github.com/user-attachments/assets/5357ace0-c52e-4a40-8836-f08aabcc4ec0" />


Принято.
**Проект: VIBE MAP v1.0**
Режим: 🧱 *Шаг за шагом. От нуля — к продакшену.*

---

### 🔧 **Общий подход**

Мы пойдём **по дорожной карте из ТЗ**, но добавим больше низкоуровневых шагов.
Каждая неделя = логически завершённый блок.
**Каждый блок разбит на этапы**:

1. Архитектура и окружение
2. Код и реализация
3. Тесты
4. Документация
5. CI/CD для автоматизации

---

## 🧭 **🔥 Полный План Разработки VIBE MAP**

---

### ✅ **НЕДЕЛЯ 1: Инициализация проекта + UI Kit**

#### 1.1 Репозиторий + DevOps база

* [ ] `git init`, создать GitHub репозиторий
* [ ] Настроить `pnpm`, `.nvmrc`, `.editorconfig`
* [ ] ESLint, Prettier, TypeScript конфиг
* [ ] GitHub Actions: CI на `pnpm lint`, `pnpm typecheck`, `pnpm test`

#### 1.2 Настроить Frontend

* [ ] `npx create-next-app@latest` (App Router, Tailwind, TypeScript)
* [ ] Удалить boilerplate, создать структуру `/app`, `/components`, `/lib`

#### 1.3 Storybook + UI Kit

* [ ] Установить Storybook (`@storybook/nextjs`)
* [ ] Создать `Button`, `Card`, `ThemeToggle`, `EmojiPicker`
* [ ] Настроить темизацию через `daisyUI`, Tailwind config

---

### ✅ **НЕДЕЛЯ 2: Карта (F2 – Map Engine MVP)**

#### 2.1 Mapbox

* [ ] Подключить Mapbox GL JS
* [ ] Добавить карту в `/map/page.tsx`, центр и зум

#### 2.2 Marker & Clustering

* [ ] Кастомные маркеры с emoji-sprite
* [ ] Реализовать кластеризацию (supercluster или Mapbox built-in)
* [ ] Анимации (Framer Motion) при появлении точки

---

### ✅ **НЕДЕЛЯ 3: Аутентификация (F3)**

* [ ] Установить и настроить NextAuth.js
* [ ] Подключить GitHub и Google провайдеры
* [ ] Аноним + deviceId — fallback стратегия (сохраняем в localStorage)
* [ ] Создать `auth-slice` в Redux Toolkit

---

### ✅ **НЕДЕЛЯ 4: API — Vibe CRUD (F4)**

#### 4.1 Backend Scaffold

* [ ] Express + Zod + CORS + Helmet
* [ ] Подключение MongoDB Atlas, схема `vibes`, `users`, `reports`
* [ ] Валидация входных данных Zod
* [ ] Эндпоинты:

  * `POST /vibes`
  * `GET /feeds?bbox&since`
  * `PUT /vibes/:id/like`
  * `POST /report`

#### 4.2 Тесты

* [ ] Unit-тесты (Vitest)
* [ ] Документация через Swagger (OpenAPI 3.1)

---

### ✅ **НЕДЕЛЯ 5: Realtime Socket Layer (F5)**

* [ ] Socket.io + Redis pub/sub
* [ ] Комната на основе `bbox`
* [ ] Ограничение по частоте (throttled emit)
* [ ] Интеграция с frontend (socket.io-client, React Query sync)

---

### ✅ **НЕДЕЛЯ 6: Time-lapse View (F6)**

* [ ] Добавить Canvas/WebGL слой над Mapbox
* [ ] Реализовать таймлайн + слайдер
* [ ] Анимация изменений "температуры эмоций"

---

### ✅ **НЕДЕЛЯ 7: Admin Dashboard (F7)**

* [ ] `/admin` с ролевым доступом через JWT
* [ ] Модерация: блокировка, удаление, бан
* [ ] Статистика и отчёты (по числу лайков, жалоб и т.д.)

---

### ✅ **НЕДЕЛЯ 8: SEO / OG / Легкость (F8)**

* [ ] SSR-рендер основных страниц
* [ ] OG-карточки — серверный рендер через Playwright screenshot
* [ ] Lighthouse → 90+ для mobile/desktop

---

### ✅ **НЕДЕЛЯ 9: Мониторинг + Выкатка (F9-F10)**

* [ ] CI: ESLint, Typecheck, Prettier, Unit, Cypress
* [ ] Docker Compose (Node, Mongo, Redis, Caddy)
* [ ] GitHub Actions (build → push → deploy)
* [ ] Деплой: Vercel (frontend), Railway/Render (backend + DB)
* [ ] Логирование: Winston → Grafana + Loki
* [ ] Uptime мониторинг: Uptime Kuma

---

## 📁 Структура проекта (вырезка)

```
/app
  /map/page.tsx
  /vibe/[id]/page.tsx
  /admin/page.tsx
  /api/geo/route.ts

/components
  Button.tsx
  Modal.tsx
  EmojiPicker.tsx
  ThemeToggle.tsx

/lib
  auth.ts
  map.ts
  socket.ts

/server
  /controllers
  /services
  /routes
  /models
  index.ts

/types
  vibe.ts
  user.ts
```

---

## ⏳ Прогресс-трекер

| Неделя | Модуль          | Статус |
| ------ | --------------- | ------ |
| 1      | Init + UI       | ⬜      |
| 2      | Map Engine      | ⬜      |
| 3      | Auth            | ⬜      |
| 4      | Vibe API        | ⬜      |
| 5      | Realtime        | ⬜      |
| 6      | Timeline        | ⬜      |
| 7      | Admin           | ⬜      |
| 8      | SEO / Share     | ⬜      |
| 9      | CI / Мониторинг | ⬜      |

---

Готов начать с **НЕДЕЛИ 1**?
Если да — скажи "Стартую неделю 1", и я сразу сгенерирую тебе **первые шаги + код и конфиги**.

🎯 Социальные фичи
Друзья на карте - показывать где сейчас твои друзья и их последние вайбы
Групповые челленджи - "кто больше городов посетит за месяц"
Комментарии к вайбам - возможность оставлять заметки к каждому месту
Шеринг вайбов - делиться своими моментами в соцсетях
🗺️ Карта и локации
Heatmap эмоций - показывать "горячие зоны" хорошего настроения в городе
Маршруты путешествий - строить линии между посещенными местами
Популярные места - рейтинг самых "вайбовых" мест в городе
Nearby vibes - уведомления когда рядом кто-то отметил крутой вайб
📊 Аналитика и геймификация
Мудборд статистика - графики настроения по времени/дням/сезонам
Достижения - "Первое посещение", "Исследователь", "Мастер настроения"
Стрики - серии дней подряд с отметками
Уровни - система прокачки за активность
🎨 Персонализация
Кастомные эмодзи - загружать свои иконки настроения
Темы карты - темная/светлая/цветная
Музыка к местам - привязывать треки к локациям через Spotify
Фото к вайбам - добавлять картинки к отметкам
🤖 AI и рекомендации
Предложения мест - "тебе может понравиться это кафе"
Анализ паттернов - "ты чаще грустишь по понедельникам"
Напоминания - "давно не отмечал вайб, как дела?"
🌟 Самые крутые идеи:
Time Travel - посмотреть как менялось твое настроение в одном месте за год
Vibe Weather - показывать "эмоциональную погоду" района
Memory Lane - автоматические воспоминания "год назад ты был тут"
Mood Sync - синхронизация с умными часами/фитнес-трекерами
