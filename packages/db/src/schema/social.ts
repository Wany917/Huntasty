import { relations } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { clanLevelEnum, clanRoleEnum } from "./enums";
import { restaurants } from "./restaurants";

export const follows = pgTable(
	"follows",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.followerId, table.followingId] })],
);

export const followRelations = relations(follows, ({ one }) => ({
	follower: one(user, {
		fields: [follows.followerId],
		references: [user.id],
		relationName: "follower",
	}),
	following: one(user, {
		fields: [follows.followingId],
		references: [user.id],
		relationName: "following",
	}),
}));

export const clans = pgTable("clans", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	description: text("description"),
	logoUrl: text("logo_url"),
	level: clanLevelEnum("level").default("rookie").notNull(),
	totalPoints: integer("total_points").default(0).notNull(),
	warWins: integer("war_wins").default(0).notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	deletedAt: timestamp("deleted_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const clanRelations = relations(clans, ({ one, many }) => ({
	creator: one(user, {
		fields: [clans.createdBy],
		references: [user.id],
	}),
	members: many(clanMembers),
	joinRequests: many(clanJoinRequests),
}));

export const clanMembers = pgTable(
	"clan_members",
	{
		clanId: text("clan_id")
			.notNull()
			.references(() => clans.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: clanRoleEnum("role").default("member").notNull(),
		joinedAt: timestamp("joined_at").defaultNow().notNull(),
		leftAt: timestamp("left_at"),
	},
	(table) => [primaryKey({ columns: [table.clanId, table.userId] })],
);

export const clanMemberRelations = relations(clanMembers, ({ one }) => ({
	clan: one(clans, {
		fields: [clanMembers.clanId],
		references: [clans.id],
	}),
	user: one(user, {
		fields: [clanMembers.userId],
		references: [user.id],
	}),
}));

export const clanJoinRequests = pgTable(
	"clan_join_requests",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		clanId: text("clan_id")
			.notNull()
			.references(() => clans.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		message: text("message"),
		status: text("status").default("pending").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("clan_join_requests_clan_id_idx").on(table.clanId),
		index("clan_join_requests_user_id_idx").on(table.userId),
	],
);

export const clanJoinRequestRelations = relations(
	clanJoinRequests,
	({ one }) => ({
		clan: one(clans, {
			fields: [clanJoinRequests.clanId],
			references: [clans.id],
		}),
		user: one(user, {
			fields: [clanJoinRequests.userId],
			references: [user.id],
		}),
	}),
);

export const groupHunts = pgTable(
	"group_hunts",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		organizerId: text("organizer_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		dateTime: timestamp("date_time").notNull(),
		maxParticipants: integer("max_participants"),
		currentParticipants: integer("current_participants").default(0).notNull(),
		budgetRange: text("budget_range"),
		restaurantId: text("restaurant_id").references(() => restaurants.id, {
			onDelete: "set null",
		}),
		visibility: text("visibility").default("public").notNull(),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("group_hunts_organizer_id_idx").on(table.organizerId),
		index("group_hunts_date_time_idx").on(table.dateTime),
	],
);

export const groupHuntRelations = relations(groupHunts, ({ one, many }) => ({
	organizer: one(user, {
		fields: [groupHunts.organizerId],
		references: [user.id],
	}),
	restaurant: one(restaurants, {
		fields: [groupHunts.restaurantId],
		references: [restaurants.id],
	}),
	participants: many(groupHuntParticipants),
	chat: many(groupHuntChat),
}));

export const groupHuntParticipants = pgTable(
	"group_hunt_participants",
	{
		huntId: text("hunt_id")
			.notNull()
			.references(() => groupHunts.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.huntId, table.userId] })],
);

export const groupHuntParticipantRelations = relations(
	groupHuntParticipants,
	({ one }) => ({
		hunt: one(groupHunts, {
			fields: [groupHuntParticipants.huntId],
			references: [groupHunts.id],
		}),
		user: one(user, {
			fields: [groupHuntParticipants.userId],
			references: [user.id],
		}),
	}),
);

export const groupHuntChat = pgTable(
	"group_hunt_chat",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		huntId: text("hunt_id")
			.notNull()
			.references(() => groupHunts.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		message: text("message").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("group_hunt_chat_hunt_id_idx").on(table.huntId)],
);

export const groupHuntChatRelations = relations(groupHuntChat, ({ one }) => ({
	hunt: one(groupHunts, {
		fields: [groupHuntChat.huntId],
		references: [groupHunts.id],
	}),
	user: one(user, {
		fields: [groupHuntChat.userId],
		references: [user.id],
	}),
}));
