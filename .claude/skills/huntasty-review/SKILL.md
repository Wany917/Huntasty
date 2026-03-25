---
name: huntasty-review
description: Implements the Huntasty review and scoring system. Use when user asks to "create a review", "add scoring", "implement anti-abuse", "build moderation", or works on review submission, weighted scores, points attribution, or review validation logic.
---

# Huntasty Review System

## Critical Rules

- Three review types: `check_in` (5pts), `quick_snap` (5pts), `full_review` (15pts)
- Restaurant scores use **weighted average** by hunter level (NOT simple average)
- ALWAYS enforce anti-abuse limits in mutations
- GPS validation is server-side (NEVER trust client-only)
- Reviews use soft delete (RGPD/APPI compliance)
- Points attribution must be traced (audit trail)

## Review Types & Validation

```typescript
import { z } from "zod"

// Shared base
const reviewBase = z.object({
  restaurantId: z.string(),
  rating: z.number().min(1).max(5).int(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Check-in: GPS + rating only
const checkInInput = reviewBase.extend({
  type: z.literal("check_in"),
  photoUrl: z.string().url().optional(),
})

// Quick Snap: photo + 3 emojis + rating
const quickSnapInput = reviewBase.extend({
  type: z.literal("quick_snap"),
  photoUrl: z.string().url(),
  emojis: z.array(z.string()).length(3),
})

// Full Review: photo + text + sub-criteria
const fullReviewInput = reviewBase.extend({
  type: z.literal("full_review"),
  photoUrl: z.string().url(),
  extraPhotos: z.array(z.string().url()).max(3).optional(),
  content: z.string().min(250).max(5000),
  tasteRating: z.number().min(1).max(5).int(),
  serviceRating: z.number().min(1).max(5).int(),
  ambianceRating: z.number().min(1).max(5).int(),
  valueRating: z.number().min(1).max(5).int(),
  tags: z.array(z.string()).max(10).optional(),
  pricePaid: z.number().positive().optional(),
})

const createReviewInput = z.discriminatedUnion("type", [
  checkInInput,
  quickSnapInput,
  fullReviewInput,
])
```

## Anti-Abuse Checks (MUST enforce in create mutation)

```typescript
async function validateAntiAbuse(ctx: Context, input: ReviewInput) {
  const userId = ctx.session.user.id

  // 1. GPS proximity: < 100m from restaurant
  const restaurant = await ctx.db.query.restaurants.findFirst({
    where: (t, { eq }) => eq(t.id, input.restaurantId),
    columns: { latitude: true, longitude: true },
  })
  if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" })
  const distance = haversineDistance(
    input.latitude, input.longitude,
    restaurant.latitude!, restaurant.longitude!,
  )
  if (distance > 100) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Too far from restaurant" })
  }

  // 2. Cooldown: 1 review per restaurant per 24h
  const recentReview = await ctx.db.query.reviews.findFirst({
    where: (t, { and, eq, gt }) => and(
      eq(t.userId, userId),
      eq(t.restaurantId, input.restaurantId),
      gt(t.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
    ),
  })
  if (recentReview) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "24h cooldown per restaurant" })
  }

  // 3. Daily rate limit: max 10 reviews/day
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayCount = await ctx.db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), gt(reviews.createdAt, todayStart)))
  if (todayCount[0].count >= 10) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Max 10 reviews per day" })
  }

  // 4. Daily points cap: 500 points/day
  // Check in points attribution logic, not here
}
```

## Weighted Score Algorithm

```typescript
const LEVEL_MULTIPLIERS = {
  apprenti: 1.0,
  palais_eveille: 1.5,
  chasseur_confirme: 2.0,
  maitre: 3.0,
  genie: 5.0,
} as const

type HunterLevel = keyof typeof LEVEL_MULTIPLIERS

function calculateWeightedScore(
  reviews: Array<{ rating: number; hunterLevel: HunterLevel }>
): number {
  let weightedSum = 0
  let totalWeight = 0

  for (const review of reviews) {
    const multiplier = LEVEL_MULTIPLIERS[review.hunterLevel]
    weightedSum += review.rating * multiplier
    totalWeight += multiplier
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0
}
```

After each review create/update/delete, recalculate and update `restaurant_stats.weighted_score`.

## Points Attribution

```typescript
const POINTS_BY_TYPE = {
  check_in: 5,
  quick_snap: 5,
  full_review: 15,
} as const

const BONUS_FIRST_DISCOVERER = 50  // First review on a restaurant
const BONUS_USEFUL_REVIEW = 20     // 10+ likes on a review
const DAILY_POINTS_CAP = 500

async function attributePoints(ctx: Context, reviewType: string, restaurantId: string) {
  const userId = ctx.session.user.id
  let points = POINTS_BY_TYPE[reviewType as keyof typeof POINTS_BY_TYPE]

  // First discoverer bonus
  const existingReviews = await ctx.db.query.reviews.findFirst({
    where: (t, { eq }) => eq(t.restaurantId, restaurantId),
  })
  if (!existingReviews) points += BONUS_FIRST_DISCOVERER

  // Check daily cap
  const todayPoints = await getTodayPoints(ctx, userId)
  const actualPoints = Math.min(points, DAILY_POINTS_CAP - todayPoints)
  if (actualPoints <= 0) return 0

  // Insert audit trail
  await ctx.db.insert(pointsLog).values({
    userId,
    action: `review_${reviewType}`,
    points: actualPoints,
    reason: `Review ${reviewType} on restaurant ${restaurantId}`,
  })

  // Update user total points
  await ctx.db.update(userStats)
    .set({ totalPoints: sql`total_points + ${actualPoints}` })
    .where(eq(userStats.userId, userId))

  // Check level up
  await checkLevelUp(ctx, userId)

  return actualPoints
}
```

## Moderation Flow

```
User reports review
  → 1 report: logged, no action
  → 3 reports: review auto-hidden + moderator notified
  → Moderator decision:
      → Legitimate: restore review
      → Minor violation: warning to author
      → Major violation: delete + warning
      → Repeat offender: suspension (7d → 30d → permanent)
```

Sanctions also remove points gained from fraudulent reviews and may trigger level downgrade.

## GPS Distance Helper

```typescript
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

## Checklist When Implementing Reviews

- [ ] Zod discriminated union for 3 review types
- [ ] GPS < 100m server-side check
- [ ] 24h cooldown per restaurant per user
- [ ] Max 10 reviews/day rate limit
- [ ] 500 points/day cap
- [ ] Weighted score recalculation on restaurant_stats
- [ ] Points audit trail (pointsLog table)
- [ ] Level-up check after points attribution
- [ ] Soft delete (deletedAt column, not hard delete)
- [ ] Report/flag mutation with 3-report auto-hide
