---
name: huntasty-restaurant
description: Implements the Huntasty restaurant system — lifecycle, claiming, dashboard, menu management, and Boost subscriptions. Use when user asks to "add restaurant", "claim restaurant", "build dashboard", "manage menu", "setup Boost", or works on restaurant profiles, org management, and B2B features.
---

# Huntasty Restaurant System

## Critical Rules

- Each restaurant is a Better Auth **Organization** (multi-tenant)
- Restaurant status follows a strict lifecycle: `imported` → `claimed` → `verified` → `partner`
- Org roles: `owner` > `manager` > `staff` — ALWAYS check permissions
- Boost subscriptions use Stripe Billing (NOT one-time charges)
- User-facing text (name, description, menu items) goes through the **translations** table
- GPS coordinates are required for all restaurants (lat/lng doublePrecision)

## Restaurant Lifecycle

```
imported    → Google Places API import (auto, basic data)
created     → Hunter discovers new restaurant (community)
claimed     → Owner verified via SMS/email
verified    → Huntasty team validated
partner     → Subscribed to a Boost plan (basic/premium/elite)
```

### Status Enum

```typescript
export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "imported", "created", "claimed", "verified", "partner"
])
```

## Claim Flow

```typescript
// Step 1: Owner requests claim
claimRequest: protectedProcedure
  .input(z.object({
    restaurantId: z.string(),
    verificationMethod: z.enum(["sms", "email"]),
    contactValue: z.string(), // phone or email
  }))
  .mutation(async ({ ctx, input }) => {
    const restaurant = await ctx.db.query.restaurants.findFirst({
      where: (t, { eq }) => eq(t.id, input.restaurantId),
    })
    if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" })
    if (!["imported", "created"].includes(restaurant.status)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Already claimed" })
    }

    // Generate 6-digit code, send via SMS/email
    const code = generateVerificationCode()
    await ctx.db.insert(claimVerifications).values({
      restaurantId: input.restaurantId,
      userId: ctx.session.user.id,
      code,
      method: input.verificationMethod,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15min
    })
    await sendVerificationCode(input.verificationMethod, input.contactValue, code)
  }),

// Step 2: Verify code → create Organization
verifyClaim: protectedProcedure
  .input(z.object({
    restaurantId: z.string(),
    code: z.string().length(6),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify code, check expiry
    // Update restaurant status to 'claimed'
    // Create Better Auth Organization for this restaurant
    // Assign user as 'owner' role in the organization
    // Update user role to include 'restaurant_owner'
  }),
```

## Permission Check Pattern

ALWAYS verify organization membership before any restaurant admin action:

```typescript
async function requireRestaurantRole(
  ctx: Context,
  restaurantId: string,
  allowedRoles: ("owner" | "manager" | "staff")[],
) {
  const membership = await ctx.db.query.organizationMembers.findFirst({
    where: (t, { and, eq }) => and(
      eq(t.userId, ctx.session.user.id),
      eq(t.organizationId, restaurantId),
    ),
  })
  if (!membership || !allowedRoles.includes(membership.role as any)) {
    throw new TRPCError({ code: "FORBIDDEN" })
  }
  return membership
}
```

### Permission Matrix

| Action | Owner | Manager | Staff |
|--------|-------|---------|-------|
| View analytics | yes | yes | yes |
| Edit profile | yes | yes | no |
| Reply to reviews | yes | yes | no |
| Manage events | yes | yes | no |
| Manage team | yes | no | no |
| Manage billing | yes | no | no |
| Change Boost plan | yes | no | no |

## Menu Management

```typescript
const menuItemInput = z.object({
  restaurantId: z.string(),
  name: z.string().min(1).max(255),        // stored via translations table
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  currency: z.string().default("JPY"),
  category: z.string(),                    // "main", "appetizer", "dessert", "drink"
  isAvailable: z.boolean().default(true),
  photoUrl: z.string().url().optional(),
  allergens: z.array(z.string()).optional(),
  isSignature: z.boolean().default(false),
})
```

Menu item names and descriptions go through the translations table — NEVER hardcode `name_ja`, `name_en` columns.

## Boost Subscription (Stripe Billing)

### Plans

| Tier | Price (JPY/month) | Stripe Price ID pattern |
|------|-------------------|------------------------|
| Basic | 15,000 | `price_boost_basic_monthly` |
| Premium | 30,000 | `price_boost_premium_monthly` |
| Elite | 60,000 | `price_boost_elite_monthly` |

### Subscription Flow

```typescript
// 1. Create Stripe Checkout session
createBoostCheckout: protectedProcedure
  .input(z.object({
    restaurantId: z.string(),
    tier: z.enum(["basic", "premium", "elite"]),
  }))
  .mutation(async ({ ctx, input }) => {
    await requireRestaurantRole(ctx, input.restaurantId, ["owner"])

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId, // from restaurant record
      line_items: [{ price: BOOST_PRICE_IDS[input.tier], quantity: 1 }],
      success_url: `${env.WEB_URL}/dashboard/${input.restaurantId}/billing?success=true`,
      cancel_url: `${env.WEB_URL}/dashboard/${input.restaurantId}/billing`,
      metadata: { restaurantId: input.restaurantId, tier: input.tier },
    })
    return { url: session.url }
  }),

// 2. Webhook: subscription.created → update restaurant status + tier
// 3. Webhook: subscription.deleted → downgrade to verified status
```

### Webhook Handler

Handle these Stripe events:
- `checkout.session.completed` → activate Boost
- `customer.subscription.updated` → tier change
- `customer.subscription.deleted` → cancel Boost, revert to `verified`
- `invoice.payment_failed` → notify owner, grace period

ALWAYS verify webhook signature with `stripe.webhooks.constructEvent()`.

## Phase 2: Reservation Commission

```typescript
// Stripe Connect destination charges
const paymentIntent = await stripe.paymentIntents.create({
  amount: reservationAmount,
  currency: "jpy",
  application_fee_amount: Math.round(reservationAmount * 0.02), // 2% commission
  transfer_data: {
    destination: restaurant.stripeConnectAccountId,
  },
})
```

## Dashboard Analytics Queries

Use denormalized `restaurant_stats` table — never compute from raw reviews:

```typescript
// Dashboard overview
getAnalytics: protectedProcedure
  .input(z.object({
    restaurantId: z.string(),
    period: z.enum(["7d", "30d", "90d", "1y"]),
  }))
  .query(async ({ ctx, input }) => {
    await requireRestaurantRole(ctx, input.restaurantId, ["owner", "manager", "staff"])

    const stats = await ctx.db.query.restaurantStats.findFirst({
      where: (t, { eq }) => eq(t.restaurantId, input.restaurantId),
    })
    // Also query time-series data from restaurant_analytics table
    return { stats, timeSeries }
  }),
```

## Checklist

- [ ] Restaurant CRUD with status lifecycle enum
- [ ] Claim flow: request → verify code → create org → assign owner
- [ ] Permission checks on ALL dashboard mutations (requireRestaurantRole)
- [ ] Menu CRUD with translations table (not hardcoded locale columns)
- [ ] Stripe Checkout for Boost subscriptions
- [ ] Stripe webhook handler with signature verification
- [ ] Analytics from denormalized stats (not computed on the fly)
- [ ] Team management via Better Auth Organizations (invite/remove members)
- [ ] GPS coordinates required on restaurant creation
- [ ] Soft delete for restaurant data (APPI compliance)
