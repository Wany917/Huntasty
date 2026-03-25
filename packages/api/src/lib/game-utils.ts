type HunterLevel =
	| "apprenti"
	| "palais_eveille"
	| "chasseur_confirme"
	| "maitre"
	| "genie";

type ReviewType = "check_in" | "quick_snap" | "full_review";

export const LEVEL_THRESHOLDS: Record<HunterLevel, number> = {
	apprenti: 0,
	palais_eveille: 500,
	chasseur_confirme: 1500,
	maitre: 4000,
	genie: 8000,
} as const;

export const LEVEL_MULTIPLIERS: Record<HunterLevel, number> = {
	apprenti: 1.0,
	palais_eveille: 1.5,
	chasseur_confirme: 2.0,
	maitre: 3.0,
	genie: 5.0,
} as const;

export const POINTS_BY_REVIEW_TYPE: Record<ReviewType, number> = {
	check_in: 5,
	quick_snap: 5,
	full_review: 15,
} as const;

export const DAILY_POINTS_CAP = 500;
export const DAILY_REVIEW_CAP = 10;
export const GPS_MAX_DISTANCE_METERS = 100;
export const REVIEW_COOLDOWN_MS = 86_400_000; // 24h

const LEVEL_ORDER: HunterLevel[] = [
	"genie",
	"maitre",
	"chasseur_confirme",
	"palais_eveille",
	"apprenti",
];

export function getLevelForPoints(totalPoints: number): HunterLevel {
	for (const level of LEVEL_ORDER) {
		if (totalPoints >= LEVEL_THRESHOLDS[level]) {
			return level;
		}
	}
	return "apprenti";
}

export function calculateWeightedScore(
	reviews: { rating: number; level: HunterLevel }[],
): number {
	if (reviews.length === 0) return 0;

	let weightedSum = 0;
	let multiplierSum = 0;

	for (const review of reviews) {
		const multiplier = LEVEL_MULTIPLIERS[review.level];
		weightedSum += review.rating * multiplier;
		multiplierSum += multiplier;
	}

	return multiplierSum === 0 ? 0 : weightedSum / multiplierSum;
}
