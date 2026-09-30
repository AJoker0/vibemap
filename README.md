# VibeMap

VibeMap is a privacy-minded social mood map. People leave a short-lived emotional signal at a place, see the atmosphere around them, and build a personal memory trail without turning the product into a permanent location tracker.

> Current status: local-first MVP hardening for a small private beta.

## Product loop

1. Open the map and choose a mood.
2. Share an approximate location for a 24-hour vibe.
3. Explore your own places, friends, and the public global pulse.
4. Return to build a personal mood memory trail.

The first release is intentionally focused on this loop. Challenges, AI recommendations, music integrations, and realtime infrastructure belong in [ROADMAP.md](ROADMAP.md), not in the MVP promise.

## Current stack

- Next.js 15 App Router and TypeScript
- React 18, React-Leaflet, Leaflet and Supercluster
- Express REST API for legacy JWT endpoints
- NextAuth Google OAuth
- MongoDB with Docker Compose
- pnpm as the only package manager
- ESLint 9 flat config and TypeScript strict mode

## Project layout

```text
src/app/                 Next.js routes and API handlers
src/components/          Map, auth, profile and UI components
src/context/              Client auth state
src/lib/                  MongoDB, API and auth helpers
server/                   Express API and auth compatibility layer
scripts/                  Database maintenance utilities
public/                   Static assets
docker-compose.yml        Local MongoDB
docs/                     Product and architecture notes
```

## Local development

### Requirements

- Node.js 20+
- pnpm
- Docker Desktop

Install dependencies and start the full local stack:

```sh
pnpm install
pnpm dev
```

The command starts MongoDB, the Express compatibility API and Next.js.

- App: http://localhost:3000
- Express health: http://localhost:5000/health
- Express test: http://localhost:5000/test

Stop the database container with:

```sh
pnpm stop:all
```

Prepare MongoDB indexes and TTL cleanup:

```sh
pnpm db:indexes
```

Run project checks:

```sh
pnpm typecheck
pnpm lint
pnpm build
```

Do not run `pnpm build` and `pnpm dev` in the same old terminal session. They now use separate Next.js output directories, but restarting the dev server after a config change is still recommended.

## Environment

Copy `.env.example` to `.env.local`. Never commit `.env.local` or real OAuth credentials.

Important variables:

- `MONGODB_URI`
- `JWT_SECRET` with at least 32 random characters
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CORS_ORIGINS`

For a deployed app, use a managed MongoDB deployment, HTTPS, a real domain, a production OAuth callback URL, and a secrets manager.

## Security baseline

- Passwords are hashed with bcrypt and new records use `passwordHash`.
- Plaintext password fallback is disabled.
- JWT secrets are loaded from environment variables; there is no hardcoded production fallback.
- Express uses Helmet, strict CORS allow-listing, JSON body limits, rate limiting on auth routes, and Zod input validation.
- New auth responses set an HttpOnly, SameSite cookie.
- Visit and active-vibe coordinates are validated, rounded to approximate neighbourhood precision, and stored as GeoJSON Points.
- MongoDB indexes include unique email/username indexes, `2dsphere` indexes and an `activeVibes.expiresAt` TTL index.

This is a security baseline, not a legal guarantee. Before public launch, complete a privacy review, account deletion flow, consent UX, age policy, incident plan, dependency audit and external penetration test.

## Privacy product rules

- Exact location is not a public product default.
- Active vibes expire after 24 hours.
- A future public release must include Ghost Mode, audience controls, clear geolocation consent, data export/deletion, and a privacy policy before opening access broadly.

## API surface

| Area | Routes | Purpose |
| --- | --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/google` | Compatibility email/password and Google JWT flow |
| Profile | `/api/profile`, `/profile` | Profile read/update |
| Vibes | `/api/active-vibe`, `/active-vibe` | 24-hour mood signal |
| Visits | `/api/visits`, `/visits` | Personal mood memories |
| Discovery | `/api/global-vibes`, `/global-vibes` | Aggregated public pulse |
| Health | `/health`, `/test` | Runtime checks |

The app currently has both NextAuth and an Express compatibility layer because existing accounts and API consumers need a migration path. New product work should target NextAuth/session-based server routes; the Express JWT path should be retired after account migration and client cleanup.

## Deployment direction

The first controlled beta can use Vercel for Next.js and MongoDB Atlas for data. The Express compatibility service must be deployed separately or removed after migration. Configure HTTPS, production CORS origins, OAuth callback URLs, monitoring, backups, rate limits and a rollback procedure before inviting external users.

## License and status

This repository is an actively developed private-beta project. Add a license and public contribution policy before open-sourcing it.
