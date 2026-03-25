# Huntasty — Claude Code Instructions

## Project

Gamified culinary discovery app. Turborepo monorepo with Bun.

## Package Manager

Always use `bun`. Never npm/yarn/pnpm.

## Monorepo Structure

- `apps/native` — Expo 55 / React Native 0.83 mobile app
- `apps/web` — Next.js 16 web app
- `apps/server` — Elysia + tRPC backend
- `apps/fumadocs` — Documentation (MDX)
- `packages/db` — PostgreSQL + PostGIS + Drizzle ORM
- `packages/api` — Shared tRPC routers
- `packages/auth` — Better Auth (organizations = restaurants)
- `packages/env` — Env validation
- `packages/ui` — Shared web components (shadcn)
- `packages/config` — Shared tsconfig

## Code Style (Biome 2.2+)

- Indentation: tabs
- Quotes: double
- Semicolons: always
- Import sorting: automatic
- Run: `bun check` (biome check --write)
- Pre-commit: Husky runs biome on staged files

## Database Conventions

- Translations table pattern (NOT _ja/_en columns)
- Cursor-based pagination (NO OFFSET)
- Denormalized stats tables (hunter_stats, restaurant_stats)
- Restaurant statuses: imported → claimed → verified → partner
- PostGIS for geospatial queries

## Native App (apps/native)

- Styling: react-native-unistyles v3 (`StyleSheet.create((theme) => ...)`)
- Fonts: Sofia Pro (Regular, Medium, SemiBold, Bold) via expo-font
- Navigation: Expo Router with tabs layout
- Lists: @shopify/flash-list v2
- Images: expo-image
- Animations: react-native-reanimated v4
- Forms: @tanstack/react-form + Zod
- Auth: @better-auth/expo + expo-secure-store
- **Expo Go limits**: expo-haptics, react-native-svg, expo-blur need dev client build

## API Conventions

- tRPC procedures with Zod input validation
- Redis for: leaderboards, sessions, rate limiting, translation cache
- Elysia with tRPC adapter

## Design System

- Primary: #042628 (navy light) / teal in dark mode
- Secondary/Accent: #70B9BE (teal)
- Border radius: 16px
- Input/button height: 54px
- Border: #E6EBF2 1.5px
- Figma file: vxInshq3in3IOgJSqQ5eFH

## Key Commands

```bash
bun dev              # All apps
bun dev:native       # Expo only
bun dev:web          # Next.js only
bun dev:server       # Elysia only
bun check            # Biome lint+format
bun check-types      # TypeScript check
bun db:push          # Push schema
bun db:studio        # Drizzle Studio
bun test             # Run tests
```
