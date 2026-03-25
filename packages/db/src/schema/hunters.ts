import { relations } from "drizzle-orm";
import {
	doublePrecision,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { hunterLevelEnum } from "./enums";

export const hunterProfiles = pgTable("hunter_profiles", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	phoneNumber: text("phone_number").unique(),
	city: text("city").default("tokyo").notNull(),
	displayName: text("display_name"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const hunterProfileRelations = relations(hunterProfiles, ({ one }) => ({
	user: one(user, {
		fields: [hunterProfiles.userId],
		references: [user.id],
	}),
}));

export const userDevices = pgTable(
	"user_devices",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		deviceId: text("device_id").notNull(),
		platform: text("platform"),
		model: text("model"),
		osVersion: text("os_version"),
		lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("user_devices_user_device_idx").on(
			table.userId,
			table.deviceId,
		),
	],
);

export const userDeviceRelations = relations(userDevices, ({ one }) => ({
	user: one(user, {
		fields: [userDevices.userId],
		references: [user.id],
	}),
}));

export const userStats = pgTable("user_stats", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	totalPoints: integer("total_points").default(0).notNull(),
	currentLevel: hunterLevelEnum("current_level").default("apprenti").notNull(),
	streakDays: integer("streak_days").default(0).notNull(),
	streakBadge: text("streak_badge"),
	confidenceScore: doublePrecision("confidence_score").default(1.0).notNull(),
	suspensionStatus: text("suspension_status"),
	suspensionUntil: timestamp("suspension_until"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const userStatsRelations = relations(userStats, ({ one }) => ({
	user: one(user, {
		fields: [userStats.userId],
		references: [user.id],
	}),
}));
