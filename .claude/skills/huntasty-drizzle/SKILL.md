---
name: huntasty-drizzle
description: Creates and modifies Drizzle ORM database schemas for Huntasty. Use when user asks to "create a table", "add a column", "modify schema", "add migration", or works on database models. Handles PostgreSQL + PostGIS + translations table pattern.
---

# Huntasty Drizzle Schema

## Critical Rules

- All schemas go in `packages/db/src/schema/`
- Use `snake_case` for all table and column names
- ALWAYS add `createdAt` and `updatedAt` timestamps
- ALWAYS export the table from the schema index
- Use `pgTable` from `drizzle-orm/pg-core`
- Reference the auth `user` table from `packages/db/src/schema/auth.ts`

## Schema Pattern

```typescript
import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const myTable = pgTable("my_table", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  // ... fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
})
```

## PostGIS for Geo Data

For tables needing location data (restaurants, check-ins):

```typescript
import { doublePrecision } from "drizzle-orm/pg-core"

// Use separate lat/lng columns (simpler than PostGIS geometry for MVP)
latitude: doublePrecision("latitude"),
longitude: doublePrecision("longitude"),
```

## Translations Pattern

User-facing text fields that need i18n use the translations table:

```typescript
export const translations = pgTable("translations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(), // "restaurant", "menu_item", "review"
  entityId: text("entity_id").notNull(),
  field: text("field").notNull(),            // "name", "description", "content"
  locale: text("locale").notNull(),          // "ja", "en", "fr"
  content: text("content").notNull(),
  source: text("source").notNull().default("manual"), // "manual" | "ai" | "import"
  confidenceScore: doublePrecision("confidence_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
})
```

Do NOT duplicate text columns like `name_ja`, `name_en`. Always use the translations table.

## Stats Denormalization

For frequently accessed aggregates, create `_stats` tables:

```typescript
export const restaurantStats = pgTable("restaurant_stats", {
  restaurantId: text("restaurant_id").primaryKey().references(() => restaurants.id),
  totalHunts: integer("total_hunts").default(0).notNull(),
  averageScore: doublePrecision("average_score"),
  weightedScore: doublePrecision("weighted_score"),
  totalReviews: integer("total_reviews").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

## After Creating/Modifying Schema

1. Export from `packages/db/src/schema/index.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:push` (dev only) or `bun run db:migrate` (staging/prod)
4. Add appropriate indexes on columns used in WHERE/ORDER BY
5. If table has relations, define them with Drizzle `relations()`

## Indexes

```typescript
import { index } from "drizzle-orm/pg-core"

// Add indexes for common queries
export const restaurants = pgTable("restaurants", {
  // ... columns
}, (table) => [
  index("restaurants_city_idx").on(table.city),
  index("restaurants_cuisine_idx").on(table.cuisineType),
  index("restaurants_location_idx").on(table.latitude, table.longitude),
])
```

## Enums

Use PostgreSQL enums for fixed sets:

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const reviewTypeEnum = pgEnum("review_type", ["check_in", "quick_snap", "full_review"])
export const hunterLevelEnum = pgEnum("hunter_level", [
  "apprenti", "palais_eveille", "chasseur_confirme", "maitre", "genie"
])
```

Consult `references/schema-overview.md` for the full entity relationship model.
