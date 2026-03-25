---
name: huntasty-social
description: Implements Huntasty social features — clans, group hunts, follows, leaderboards, and clan wars. Use when user asks to "create a clan", "add follow system", "build group hunt", "implement leaderboard", or works on social interactions and competitive features.
---

# Huntasty Social System

## Critical Rules

- Clans: 4–20 members, creation requires Chasseur Confirmé (level 3+)
- Follows are **unidirectional** (like Instagram, NOT mutual)
- Group hunts require GPS verification for ALL participants
- Clan points have a daily cap of 500
- 7-day cooldown before joining a new clan after leaving one
- Use cursor-based pagination for feeds and leaderboards

## Clan Structure

### Clan Schema Essentials

```typescript
// Clan roles
export const clanRoleEnum = pgEnum("clan_role", ["leader", "officer", "member"])

// Clan levels (progression, not auth)
export const clanLevelEnum = pgEnum("clan_level", ["rookie", "confirmed", "elite", "legendary"])
```

### Clan Level Thresholds

| Level | Cumulative Points | Unlocks |
|-------|-------------------|---------|
| Rookie | 0 | Base features, chat |
| Confirmed | 5,000 | Internal challenges |
| Elite | 20,000 | Clan Wars participation |
| Legendary | 50,000 + Clan War win | Legendary badge, exclusive events |

### Clan Points Modifiers

```typescript
function calculateClanPoints(memberPoints: number, clanSize: number): number {
  let modifier = 1.0
  if (clanSize >= 4 && clanSize <= 8) {
    modifier = 1.25 // +25% underdog bonus
  } else if (clanSize >= 16 && clanSize <= 20) {
    modifier = 0.90 // -10% large clan handicap
  }
  return Math.floor(memberPoints * modifier)
}

const DAILY_CLAN_POINTS_CAP = 500
```

### Join/Leave Rules

```typescript
// Joining: candidate submits → existing members vote
const joinClanInput = z.object({
  clanId: z.string(),
  message: z.string().max(500).optional(), // motivation
})

// Leave: immediate, but 7-day cooldown before joining another
const CLAN_SWITCH_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

async function canJoinClan(ctx: Context): Promise<boolean> {
  const lastLeft = await ctx.db.query.clanMembershipHistory.findFirst({
    where: (t, { eq, desc }) => eq(t.userId, ctx.session.user.id),
    orderBy: (t, { desc }) => [desc(t.leftAt)],
  })
  if (!lastLeft?.leftAt) return true
  return Date.now() - lastLeft.leftAt.getTime() > CLAN_SWITCH_COOLDOWN_MS
}
```

## Follow System

Unidirectional follows — no friend requests, no mutual requirement.

```typescript
// Follow/unfollow mutation
follow: protectedProcedure
  .input(z.object({ targetUserId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (input.targetUserId === ctx.session.user.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself" })
    }
    await ctx.db.insert(follows).values({
      followerId: ctx.session.user.id,
      followingId: input.targetUserId,
    }).onConflictDoNothing()
  }),

// Feed: reviews from followed users (cursor-based)
feed: protectedProcedure
  .input(z.object({
    cursor: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
  }))
  .query(async ({ ctx, input }) => {
    const followedIds = await ctx.db
      .select({ id: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, ctx.session.user.id))

    const items = await ctx.db.query.reviews.findMany({
      where: (t, { and, inArray, lt }) => and(
        inArray(t.userId, followedIds.map(f => f.id)),
        input.cursor ? lt(t.createdAt, new Date(input.cursor!)) : undefined,
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: input.limit + 1,
      with: { user: true, restaurant: true },
    })

    let nextCursor: string | undefined
    if (items.length > input.limit) {
      nextCursor = items.pop()!.createdAt.toISOString()
    }
    return { items, nextCursor }
  }),
```

## Group Hunts

Temporary outings — open to anyone or friends-only.

### Creation Rules

```typescript
const createGroupHuntInput = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  dateTime: z.date().refine(d => d > new Date(), "Must be in the future"),
  maxParticipants: z.number().min(2).max(50).default(10),
  budgetRange: z.enum(["budget", "moderate", "premium"]).optional(),
  restaurantId: z.string().optional(), // can be decided later
  visibility: z.enum(["friends", "community"]),
})
```

### Points Rules

- All participants: **x2 multiplier** on review points (GPS must verify all)
- Organizer: **150 points flat bonus**
- Hunt marathon: **300 points flat** if 3+ restaurants in 24h
- Chat: available during hunt + 48h after, then archived

## Leaderboards

```typescript
const leaderboardInput = z.object({
  scope: z.enum(["local", "national", "global", "clan"]),
  period: z.enum(["weekly", "monthly", "all_time"]),
  city: z.string().optional(), // required if scope = "local"
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
})
```

Use denormalized `_stats` tables for leaderboard queries — never compute rankings from raw reviews at query time.

## Clan Wars (Seasonal)

- **Frequency**: Every 3 months
- **Duration**: 2 weeks
- **Eligibility**: Elite+ clans only
- **Scoring**: Points accumulated during the war period
- **Reward**: Winning clan gets a sponsored premium dinner
- Track via `clan_war_seasons` and `clan_war_entries` tables

## Checklist

- [ ] Follow/unfollow with onConflictDoNothing (idempotent)
- [ ] Social feed with cursor pagination + with user/restaurant
- [ ] Clan CRUD with role permissions (leader manages, members view)
- [ ] Clan join = candidature + vote flow
- [ ] 7-day cooldown on clan switch
- [ ] Group hunt creation with future date validation
- [ ] GPS verification for ALL group hunt participants
- [ ] x2 multiplier for group hunt reviews
- [ ] 500 pts/day clan cap
- [ ] Leaderboard from _stats tables (not computed on the fly)
