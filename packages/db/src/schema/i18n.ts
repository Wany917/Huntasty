import {
	doublePrecision,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const translations = pgTable(
	"translations",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		entityType: text("entity_type").notNull(),
		entityId: text("entity_id").notNull(),
		field: text("field").notNull(),
		locale: text("locale").notNull(),
		content: text("content").notNull(),
		source: text("source").default("manual").notNull(),
		confidenceScore: doublePrecision("confidence_score").default(1.0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("translations_entity_field_locale_idx").on(
			table.entityType,
			table.entityId,
			table.field,
			table.locale,
		),
	],
);
