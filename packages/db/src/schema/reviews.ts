import { relations } from "drizzle-orm";
import {
	doublePrecision,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { reviewTypeEnum } from "./enums";
import { restaurants } from "./restaurants";

export const reviews = pgTable(
	"reviews",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		restaurantId: text("restaurant_id")
			.notNull()
			.references(() => restaurants.id, { onDelete: "cascade" }),
		type: reviewTypeEnum("type").notNull(),
		rating: integer("rating").notNull(),
		photoUrl: text("photo_url"),
		extraPhotos: jsonb("extra_photos").$type<string[]>().default([]),
		content: text("content"),
		latitude: doublePrecision("latitude"),
		longitude: doublePrecision("longitude"),
		tasteRating: integer("taste_rating"),
		serviceRating: integer("service_rating"),
		ambianceRating: integer("ambiance_rating"),
		valueRating: integer("value_rating"),
		emojis: jsonb("emojis").$type<string[]>().default([]),
		tags: jsonb("tags").$type<string[]>().default([]),
		pricePaid: integer("price_paid"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("reviews_user_restaurant_idx").on(table.userId, table.restaurantId),
		index("reviews_created_at_idx").on(table.createdAt),
		index("reviews_restaurant_id_idx").on(table.restaurantId),
	],
);

export const reviewRelations = relations(reviews, ({ one, many }) => ({
	user: one(user, {
		fields: [reviews.userId],
		references: [user.id],
	}),
	restaurant: one(restaurants, {
		fields: [reviews.restaurantId],
		references: [restaurants.id],
	}),
	likes: many(reviewLikes),
	reports: many(reviewReports),
}));

export const reviewLikes = pgTable(
	"review_likes",
	{
		reviewId: text("review_id")
			.notNull()
			.references(() => reviews.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.reviewId, table.userId] })],
);

export const reviewLikeRelations = relations(reviewLikes, ({ one }) => ({
	review: one(reviews, {
		fields: [reviewLikes.reviewId],
		references: [reviews.id],
	}),
	user: one(user, {
		fields: [reviewLikes.userId],
		references: [user.id],
	}),
}));

export const reviewReports = pgTable(
	"review_reports",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		reviewId: text("review_id")
			.notNull()
			.references(() => reviews.id, { onDelete: "cascade" }),
		reporterId: text("reporter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reason: text("reason").notNull(),
		status: text("status").default("pending").notNull(),
		resolution: text("resolution"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("review_reports_review_id_idx").on(table.reviewId)],
);

export const reviewReportRelations = relations(reviewReports, ({ one }) => ({
	review: one(reviews, {
		fields: [reviewReports.reviewId],
		references: [reviews.id],
	}),
	reporter: one(user, {
		fields: [reviewReports.reporterId],
		references: [user.id],
	}),
}));

export const pointsLog = pgTable(
	"points_log",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		action: text("action").notNull(),
		points: integer("points").notNull(),
		reason: text("reason"),
		referenceId: text("reference_id"),
		referenceType: text("reference_type"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("points_log_user_created_idx").on(table.userId, table.createdAt),
	],
);

export const pointsLogRelations = relations(pointsLog, ({ one }) => ({
	user: one(user, {
		fields: [pointsLog.userId],
		references: [user.id],
	}),
}));
