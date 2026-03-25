import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { clans } from "./social";

export const clanWarSeasons = pgTable("clan_war_seasons", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	seasonNumber: integer("season_number").unique().notNull(),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date").notNull(),
	status: text("status").default("upcoming").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const clanWarSeasonRelations = relations(clanWarSeasons, ({ many }) => ({
	entries: many(clanWarEntries),
}));

export const clanWarEntries = pgTable(
	"clan_war_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		seasonId: text("season_id")
			.notNull()
			.references(() => clanWarSeasons.id, { onDelete: "cascade" }),
		clanId: text("clan_id")
			.notNull()
			.references(() => clans.id, { onDelete: "cascade" }),
		pointsAccumulated: integer("points_accumulated").default(0).notNull(),
		rank: integer("rank"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("clan_war_entries_season_id_idx").on(table.seasonId),
		index("clan_war_entries_clan_id_idx").on(table.clanId),
	],
);

export const clanWarEntryRelations = relations(clanWarEntries, ({ one }) => ({
	season: one(clanWarSeasons, {
		fields: [clanWarEntries.seasonId],
		references: [clanWarSeasons.id],
	}),
	clan: one(clans, {
		fields: [clanWarEntries.clanId],
		references: [clans.id],
	}),
}));
