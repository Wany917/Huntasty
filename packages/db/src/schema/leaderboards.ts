import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const leaderboardEntries = pgTable(
	"leaderboard_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		scope: text("scope").notNull(),
		period: text("period").notNull(),
		city: text("city"),
		rank: integer("rank").notNull(),
		points: integer("points").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("leaderboard_scope_period_rank_idx").on(
			table.scope,
			table.period,
			table.rank,
		),
		index("leaderboard_user_id_idx").on(table.userId),
	],
);

export const leaderboardEntryRelations = relations(
	leaderboardEntries,
	({ one }) => ({
		user: one(user, {
			fields: [leaderboardEntries.userId],
			references: [user.id],
		}),
	}),
);
