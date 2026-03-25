import { pgEnum } from "drizzle-orm/pg-core";

export const reviewTypeEnum = pgEnum("review_type", [
	"check_in",
	"quick_snap",
	"full_review",
]);

export const hunterLevelEnum = pgEnum("hunter_level", [
	"apprenti",
	"palais_eveille",
	"chasseur_confirme",
	"maitre",
	"genie",
]);

export const restaurantStatusEnum = pgEnum("restaurant_status", [
	"imported",
	"created",
	"claimed",
	"verified",
	"partner",
]);

export const clanRoleEnum = pgEnum("clan_role", [
	"leader",
	"officer",
	"member",
]);

export const clanLevelEnum = pgEnum("clan_level", [
	"rookie",
	"confirmed",
	"elite",
	"legendary",
]);

export const boostTierEnum = pgEnum("boost_tier", [
	"basic",
	"premium",
	"elite",
]);
