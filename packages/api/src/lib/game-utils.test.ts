import { describe, expect, test } from "bun:test";

import {
	calculateWeightedScore,
	DAILY_POINTS_CAP,
	DAILY_REVIEW_CAP,
	GPS_MAX_DISTANCE_METERS,
	getLevelForPoints,
	LEVEL_MULTIPLIERS,
	LEVEL_THRESHOLDS,
	POINTS_BY_REVIEW_TYPE,
	REVIEW_COOLDOWN_MS,
} from "./game-utils";

// ─── Constants ───────────────────────────────────────────────────────────────

describe("constants", () => {
	test("DAILY_POINTS_CAP is 500", () => {
		expect(DAILY_POINTS_CAP).toBe(500);
	});

	test("DAILY_REVIEW_CAP is 10", () => {
		expect(DAILY_REVIEW_CAP).toBe(10);
	});

	test("GPS_MAX_DISTANCE_METERS is 100", () => {
		expect(GPS_MAX_DISTANCE_METERS).toBe(100);
	});

	test("REVIEW_COOLDOWN_MS is 24h", () => {
		expect(REVIEW_COOLDOWN_MS).toBe(86_400_000);
	});

	test("POINTS_BY_REVIEW_TYPE values", () => {
		expect(POINTS_BY_REVIEW_TYPE.check_in).toBe(5);
		expect(POINTS_BY_REVIEW_TYPE.quick_snap).toBe(5);
		expect(POINTS_BY_REVIEW_TYPE.full_review).toBe(15);
	});

	test("LEVEL_THRESHOLDS are in ascending order", () => {
		expect(LEVEL_THRESHOLDS.apprenti).toBe(0);
		expect(LEVEL_THRESHOLDS.palais_eveille).toBe(500);
		expect(LEVEL_THRESHOLDS.chasseur_confirme).toBe(1500);
		expect(LEVEL_THRESHOLDS.maitre).toBe(4000);
		expect(LEVEL_THRESHOLDS.genie).toBe(8000);
	});

	test("LEVEL_MULTIPLIERS values", () => {
		expect(LEVEL_MULTIPLIERS.apprenti).toBe(1.0);
		expect(LEVEL_MULTIPLIERS.palais_eveille).toBe(1.5);
		expect(LEVEL_MULTIPLIERS.chasseur_confirme).toBe(2.0);
		expect(LEVEL_MULTIPLIERS.maitre).toBe(3.0);
		expect(LEVEL_MULTIPLIERS.genie).toBe(5.0);
	});
});

// ─── getLevelForPoints ───────────────────────────────────────────────────────

describe("getLevelForPoints", () => {
	test("0 pts → apprenti", () => {
		expect(getLevelForPoints(0)).toBe("apprenti");
	});

	test("499 pts → apprenti", () => {
		expect(getLevelForPoints(499)).toBe("apprenti");
	});

	test("500 pts → palais_eveille", () => {
		expect(getLevelForPoints(500)).toBe("palais_eveille");
	});

	test("1499 pts → palais_eveille", () => {
		expect(getLevelForPoints(1499)).toBe("palais_eveille");
	});

	test("1500 pts → chasseur_confirme", () => {
		expect(getLevelForPoints(1500)).toBe("chasseur_confirme");
	});

	test("4000 pts → maitre", () => {
		expect(getLevelForPoints(4000)).toBe("maitre");
	});

	test("7999 pts → maitre", () => {
		expect(getLevelForPoints(7999)).toBe("maitre");
	});

	test("8000 pts → genie", () => {
		expect(getLevelForPoints(8000)).toBe("genie");
	});

	test("99999 pts → genie (stays at max)", () => {
		expect(getLevelForPoints(99999)).toBe("genie");
	});

	test("negative number → apprenti", () => {
		expect(getLevelForPoints(-100)).toBe("apprenti");
	});
});

// ─── calculateWeightedScore ──────────────────────────────────────────────────

describe("calculateWeightedScore", () => {
	test("empty array → 0", () => {
		expect(calculateWeightedScore([])).toBe(0);
	});

	test("single apprenti review (rating 4) → 4.0", () => {
		const score = calculateWeightedScore([{ rating: 4, level: "apprenti" }]);
		expect(score).toBe(4.0);
	});

	test("two reviews same level → simple average", () => {
		const score = calculateWeightedScore([
			{ rating: 3, level: "apprenti" },
			{ rating: 5, level: "apprenti" },
		]);
		expect(score).toBe(4.0);
	});

	test("reviews of different levels → weighted score", () => {
		// apprenti(4, x1.0) + genie(5, x5.0) → (4×1 + 5×5) / (1+5) = 29/6 ≈ 4.833
		const score = calculateWeightedScore([
			{ rating: 4, level: "apprenti" },
			{ rating: 5, level: "genie" },
		]);
		expect(score).toBeCloseTo(29 / 6, 10);
	});

	test("all levels contribute correctly", () => {
		// apprenti(3, x1.0) + palais_eveille(4, x1.5) + chasseur_confirme(5, x2.0)
		// = (3×1 + 4×1.5 + 5×2) / (1 + 1.5 + 2) = (3 + 6 + 10) / 4.5 = 19/4.5 ≈ 4.222
		const score = calculateWeightedScore([
			{ rating: 3, level: "apprenti" },
			{ rating: 4, level: "palais_eveille" },
			{ rating: 5, level: "chasseur_confirme" },
		]);
		expect(score).toBeCloseTo(19 / 4.5, 10);
	});

	test("single genie review (rating 1) → 1.0", () => {
		const score = calculateWeightedScore([{ rating: 1, level: "genie" }]);
		expect(score).toBe(1.0);
	});
});
