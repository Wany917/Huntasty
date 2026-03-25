---
name: huntasty-trpc
description: Creates tRPC routers and procedures for the Huntasty API. Use when user asks to "create an API route", "add an endpoint", "create a procedure", or works on backend API logic. Handles Zod validation, cursor pagination, and Drizzle queries.
---

# Huntasty tRPC Router

## Critical Rules

- All routers go in `packages/api/src/routers/`
- Register new routers in `packages/api/src/routers/index.ts`
- ALWAYS validate inputs with Zod
- ALWAYS use cursor-based pagination (NEVER OFFSET)
- Use `protectedProcedure` for authenticated routes, `publicProcedure` for public
- Handle errors with tRPC error codes

## Router Template

```typescript
import { z } from "zod"
import { router, publicProcedure, protectedProcedure } from "../trpc"
import { eq, desc, and, lt } from "drizzle-orm"
import { myTable } from "@huntasty/db/schema"
import { TRPCError } from "@trpc/server"

export const myRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.myTable.findFirst({
        where: (t, { eq }) => eq(t.id, input.id),
      })
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" })
      }
      return result
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db.insert(myTable).values({
        ...input,
        userId: ctx.session.user.id,
      }).returning()
      return created
    }),
})
```

## Register Router

```typescript
// packages/api/src/routers/index.ts
import { myRouter } from "./my-router"

export const appRouter = router({
  my: myRouter,
  // ... existing routers
})
```

## Cursor-Based Pagination

ALWAYS use this pattern for list endpoints:

```typescript
list: publicProcedure
  .input(z.object({
    cursor: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
  }))
  .query(async ({ ctx, input }) => {
    const items = await ctx.db.query.myTable.findMany({
      where: input.cursor
        ? (t, { lt }) => lt(t.createdAt, new Date(input.cursor!))
        : undefined,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: input.limit + 1,
    })

    let nextCursor: string | undefined
    if (items.length > input.limit) {
      const nextItem = items.pop()!
      nextCursor = nextItem.createdAt.toISOString()
    }

    return { items, nextCursor }
  }),
```

## Error Codes

| Code | When |
|------|------|
| `UNAUTHORIZED` | No session |
| `FORBIDDEN` | Has session but wrong permissions |
| `NOT_FOUND` | Resource doesn't exist |
| `BAD_REQUEST` | Invalid input (Zod handles this automatically) |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |

## Permission Checks

For restaurant admin routes, verify organization membership:

```typescript
.mutation(async ({ ctx, input }) => {
  // Verify user is owner/manager of this restaurant
  const membership = await ctx.db.query.organizationMembers.findFirst({
    where: (t, { and, eq }) => and(
      eq(t.userId, ctx.session.user.id),
      eq(t.organizationId, input.restaurantId),
    ),
  })
  if (!membership || !["owner", "manager"].includes(membership.role)) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  // ... proceed
})
```

## Context Shape

```typescript
// ctx.db      → Drizzle instance
// ctx.session → Better Auth session (null if publicProcedure)
// ctx.session.user.id    → Current user ID
// ctx.session.user.role  → "user" | "admin"
```
