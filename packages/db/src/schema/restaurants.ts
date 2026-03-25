import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { boostTierEnum, restaurantStatusEnum } from "./enums";

export const restaurants = pgTable(
	"restaurants",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text("name").notNull(),
		latitude: doublePrecision("latitude").notNull(),
		longitude: doublePrecision("longitude").notNull(),
		status: restaurantStatusEnum("status").default("imported").notNull(),
		city: text("city").default("tokyo").notNull(),
		cuisineType: text("cuisine_type"),
		address: text("address"),
		priceRange: integer("price_range"),
		phone: text("phone"),
		website: text("website"),
		googlePlaceId: text("google_place_id"),
		stripeCustomerId: text("stripe_customer_id"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("restaurants_city_idx").on(table.city),
		index("restaurants_cuisine_type_idx").on(table.cuisineType),
		index("restaurants_lat_lng_idx").on(table.latitude, table.longitude),
		index("restaurants_status_idx").on(table.status),
		index("restaurants_google_place_id_idx").on(table.googlePlaceId),
	],
);

export const restaurantRelations = relations(restaurants, ({ one, many }) => ({
	stats: one(restaurantStats, {
		fields: [restaurants.id],
		references: [restaurantStats.restaurantId],
	}),
	menuItems: many(menuItems),
	boostSubscription: one(boostSubscriptions, {
		fields: [restaurants.id],
		references: [boostSubscriptions.restaurantId],
	}),
}));

export const restaurantStats = pgTable("restaurant_stats", {
	restaurantId: text("restaurant_id")
		.primaryKey()
		.references(() => restaurants.id, { onDelete: "cascade" }),
	totalHunts: integer("total_hunts").default(0).notNull(),
	averageScore: doublePrecision("average_score").default(0).notNull(),
	weightedScore: doublePrecision("weighted_score").default(0).notNull(),
	totalReviews: integer("total_reviews").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const restaurantStatsRelations = relations(
	restaurantStats,
	({ one }) => ({
		restaurant: one(restaurants, {
			fields: [restaurantStats.restaurantId],
			references: [restaurants.id],
		}),
	}),
);

export const menuItems = pgTable(
	"menu_items",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		restaurantId: text("restaurant_id")
			.notNull()
			.references(() => restaurants.id, { onDelete: "cascade" }),
		price: integer("price"),
		currency: text("currency").default("JPY").notNull(),
		category: text("category"),
		isAvailable: boolean("is_available").default(true).notNull(),
		photoUrl: text("photo_url"),
		allergens: jsonb("allergens").$type<string[]>().default([]),
		isSignature: boolean("is_signature").default(false).notNull(),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("menu_items_restaurant_id_idx").on(table.restaurantId)],
);

export const menuItemRelations = relations(menuItems, ({ one }) => ({
	restaurant: one(restaurants, {
		fields: [menuItems.restaurantId],
		references: [restaurants.id],
	}),
}));

export const claimVerifications = pgTable(
	"claim_verifications",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		restaurantId: text("restaurant_id")
			.notNull()
			.references(() => restaurants.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		code: text("code").notNull(),
		method: text("method").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("claim_verifications_restaurant_id_idx").on(table.restaurantId),
	],
);

export const claimVerificationRelations = relations(
	claimVerifications,
	({ one }) => ({
		restaurant: one(restaurants, {
			fields: [claimVerifications.restaurantId],
			references: [restaurants.id],
		}),
		user: one(user, {
			fields: [claimVerifications.userId],
			references: [user.id],
		}),
	}),
);

export const boostSubscriptions = pgTable("boost_subscriptions", {
	restaurantId: text("restaurant_id")
		.primaryKey()
		.references(() => restaurants.id, { onDelete: "cascade" }),
	tier: boostTierEnum("tier").notNull(),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: text("status").default("active").notNull(),
	startedAt: timestamp("started_at").defaultNow().notNull(),
	endedAt: timestamp("ended_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const boostSubscriptionRelations = relations(
	boostSubscriptions,
	({ one }) => ({
		restaurant: one(restaurants, {
			fields: [boostSubscriptions.restaurantId],
			references: [restaurants.id],
		}),
	}),
);
