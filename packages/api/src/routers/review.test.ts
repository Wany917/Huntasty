import { describe, expect, test } from "bun:test";
import { t } from "../index";
import {
	DAILY_POINTS_CAP,
	DAILY_REVIEW_CAP,
	POINTS_BY_REVIEW_TYPE,
} from "../lib/game-utils";
import { reviewRouter } from "./review";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TOKYO_STATION = { lat: 35.6812, lng: 139.7671 };

function createMockSession(userId = "user-1") {
	return {
		user: { id: userId },
		session: { id: "session-1" },
	};
}

/**
 * Creates a chainable mock that simulates Drizzle's query builder.
 * Each call returns a new chain, and the terminal call resolves to `result`.
 */
function createQueryChain(result: unknown = []) {
	const chain: Record<string, unknown> = {};
	const handler: ProxyHandler<Record<string, unknown>> = {
		get(_target, prop) {
			if (prop === "then") {
				// Make it thenable so `await` resolves to result
				return (resolve: (v: unknown) => void) => resolve(result);
			}
			// Every method call returns the same proxy (chainable)
			return (..._args: unknown[]) => new Proxy(chain, handler);
		},
	};
	return new Proxy(chain, handler);
}

function createMockDb(
	overrides: {
		restaurantResult?: unknown[];
		recentReviewResult?: unknown[];
		dailyReviewCount?: number;
		dailyPointsTotal?: number;
		currentStats?: unknown[];
		allReviews?: unknown[];
		reviewerStats?: unknown[];
	} = {},
) {
	const {
		restaurantResult = [
			{
				id: "rest-1",
				latitude: TOKYO_STATION.lat,
				longitude: TOKYO_STATION.lng,
			},
		],
		recentReviewResult = [],
		dailyReviewCount = 0,
		dailyPointsTotal = 0,
		currentStats = [
			{ userId: "user-1", totalPoints: 0, currentLevel: "apprenti" },
		],
		allReviews = [],
		reviewerStats = [],
	} = overrides;

	// Map each sequential select() call to its expected result
	const selectResults = [
		restaurantResult, // 1. Restaurant exists check
		recentReviewResult, // 2. Cooldown check
		[{ count: dailyReviewCount }], // 3. Daily review count
	];

	// Transaction inner selects
	const txSelectResults = [
		[{ total: dailyPointsTotal }], // 1. Daily points so far
		currentStats, // 2. Current user stats
		allReviews, // 3. All reviews for restaurant
		reviewerStats, // 4. Reviewer stats
	];

	const createSelectChain = (results: unknown[][], indexRef: { i: number }) => {
		return () => {
			const idx = indexRef.i++;
			return createQueryChain(results[idx] ?? []);
		};
	};

	const outerIndex = { i: 0 };

	const mockTx = (() => {
		const txIndex = { i: 0 };
		return {
			select: createSelectChain(txSelectResults, txIndex),
			insert: () =>
				createQueryChain([
					{
						id: "review-1",
						userId: "user-1",
						restaurantId: "rest-1",
						type: "check_in",
						rating: 4,
					},
				]),
			update: () => createQueryChain([]),
		};
	})();

	return {
		select: createSelectChain(selectResults, outerIndex),
		transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
			return fn(mockTx);
		},
	};
}

const createCaller = t.createCallerFactory(reviewRouter);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("review.create", () => {
	const validCheckIn = {
		type: "check_in" as const,
		restaurantId: "rest-1",
		latitude: TOKYO_STATION.lat,
		longitude: TOKYO_STATION.lng,
		rating: 4,
	};

	// ── GPS guard ──────────────────────────────────────────────────────────

	test("rejects review when too far from restaurant", async () => {
		const db = createMockDb();
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const farAwayInput = {
			...validCheckIn,
			// ~6km away from restaurant (Shibuya)
			latitude: 35.658,
			longitude: 139.7016,
		};

		await expect(caller.create(farAwayInput)).rejects.toThrow(
			/Too far from restaurant/,
		);
	});

	// ── Restaurant not found ───────────────────────────────────────────────

	test("rejects when restaurant does not exist", async () => {
		const db = createMockDb({ restaurantResult: [] });
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		await expect(caller.create(validCheckIn)).rejects.toThrow(
			/Restaurant not found/,
		);
	});

	// ── Cooldown ───────────────────────────────────────────────────────────

	test("rejects 2nd review for same restaurant within 24h", async () => {
		const db = createMockDb({
			recentReviewResult: [{ id: "existing-review" }],
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		await expect(caller.create(validCheckIn)).rejects.toThrow(
			/already reviewed this restaurant/,
		);
	});

	// ── Daily review cap ───────────────────────────────────────────────────

	test("rejects when daily review cap is reached", async () => {
		const db = createMockDb({
			dailyReviewCount: DAILY_REVIEW_CAP,
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		await expect(caller.create(validCheckIn)).rejects.toThrow(
			/Daily review limit reached/,
		);
	});

	// ── Points calculation ─────────────────────────────────────────────────

	test("check_in awards 5 points", async () => {
		const db = createMockDb();
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const result = await caller.create(validCheckIn);
		expect(result.pointsEarned).toBe(POINTS_BY_REVIEW_TYPE.check_in);
	});

	test("full_review awards 15 points", async () => {
		const db = createMockDb();
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const result = await caller.create({
			type: "full_review",
			restaurantId: "rest-1",
			latitude: TOKYO_STATION.lat,
			longitude: TOKYO_STATION.lng,
			rating: 5,
			content: "A".repeat(250),
			tasteRating: 5,
			serviceRating: 5,
			ambianceRating: 5,
			valueRating: 5,
		});
		expect(result.pointsEarned).toBe(POINTS_BY_REVIEW_TYPE.full_review);
	});

	// ── Daily points cap ───────────────────────────────────────────────────

	test("caps points when daily limit almost reached", async () => {
		const db = createMockDb({
			dailyPointsTotal: 498,
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const result = await caller.create(validCheckIn);
		// check_in = 5pts, but only 2 remain (500 - 498)
		expect(result.pointsEarned).toBe(2);
	});

	test("0 points when daily cap already reached", async () => {
		const db = createMockDb({
			dailyPointsTotal: DAILY_POINTS_CAP,
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const result = await caller.create(validCheckIn);
		expect(result.pointsEarned).toBe(0);
	});

	// ── Level up ───────────────────────────────────────────────────────────

	test("level up when crossing 500pts threshold", async () => {
		const db = createMockDb({
			currentStats: [
				{ userId: "user-1", totalPoints: 497, currentLevel: "apprenti" },
			],
			dailyPointsTotal: 0,
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		// check_in = 5pts → 497 + 5 = 502 → palais_eveille
		const result = await caller.create(validCheckIn);
		expect(result.levelUp).toEqual({
			from: "apprenti",
			to: "palais_eveille",
		});
	});

	test("no level up when staying in same tier", async () => {
		const db = createMockDb({
			currentStats: [
				{ userId: "user-1", totalPoints: 10, currentLevel: "apprenti" },
			],
		});
		const caller = createCaller({
			db: db as any,
			session: createMockSession() as any,
		});

		const result = await caller.create(validCheckIn);
		expect(result.levelUp).toBeNull();
	});
});
