# Huntasty

Gamified culinary discovery app — find, review, and compete around the best food spots.

## Stack

- **Mobile**: Expo / React Native
- **Web**: Next.js 16
- **Backend**: Elysia + tRPC
- **Database**: PostgreSQL + PostGIS + Drizzle ORM
- **Auth**: Better Auth
- **Monorepo**: Turborepo + Bun

## Structure

```
apps/
  native/       # Expo mobile app (iOS/Android)
  web/          # Next.js web app
  server/       # Elysia backend API
  fumadocs/     # Documentation site
packages/
  api/          # Shared tRPC routers
  auth/         # Better Auth config
  db/           # Drizzle schema + migrations
  env/          # Environment variables
  ui/           # Shared web components (shadcn)
  config/       # Shared TypeScript config
```

## Getting Started

```bash
# Prerequisites: Bun 1.3+, Docker 24+

# Install dependencies
bun install

# Start database
bun run db:start

# Push schema
bun run db:push

# Start all dev servers
bun dev
```

### Individual apps

```bash
bun dev:native    # Expo dev server
bun dev:web       # Next.js dev server
bun dev:server    # Elysia backend
```

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start all apps |
| `bun build` | Production build |
| `bun check` | Biome lint + format |
| `bun check-types` | TypeScript type check |
| `bun test` | Run tests |
| `bun db:studio` | Drizzle Studio |
| `bun db:push` | Push schema changes |
| `bun db:generate` | Generate migrations |

## Documentation

Full docs available at `apps/fumadocs/` — covers product specs, technical architecture, and business strategy.
