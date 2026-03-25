import { user } from "@Huntasty/db/schema/auth";
import { hunterProfiles, userStats } from "@Huntasty/db/schema/hunters";
import { restaurantStats, restaurants } from "@Huntasty/db/schema/restaurants";
import {
	pointsLog,
	reviewLikes,
	reviewReports,
	reviews,
} from "@Huntasty/db/schema/reviews";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";
import {
	calculateWeightedScore,
	DAILY_POINTS_CAP,
	DAILY_REVIEW_CAP,
	GPS_MAX_DISTANCE_METERS,
	getLevelForPoints,
	POINTS_BY_REVIEW_TYPE,
	REVIEW_COOLDOWN_MS,
} from "../lib/game-utils";
import { haversineDistance } from "../lib/haversine";

const baseReviewInput = z.object({
	restaurantId: z.string(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
	rating: z.number().int().min(1).max(5),
});

const checkInInput = baseReviewInput.extend({
	type: z.literal("check_in"),
});

const quickSnapInput = baseReviewInput.extend({
	type: z.literal("quick_snap"),
	photoUrl: z.string().url(),
	emojis: z.array(z.string()).min(1).max(5),
});

const fullReviewInput = baseReviewInput.extend({
	type: z.literal("full_review"),
	content: z.string().min(250),
	photoUrl: z.string().url().optional(),
	extraPhotos: z.array(z.string().url()).max(5).optional(),
	tasteRating: z.number().int().min(1).max(5),
	serviceRating: z.number().int().min(1).max(5),
	ambianceRating: z.number().int().min(1).max(5),
	valueRating: z.number().int().min(1).max(5),
	emojis: z.array(z.string()).max(5).optional(),
	tags: z.array(z.string()).max(10).optional(),
	pricePaid: z.number().int().positive().optional(),
});

const createReviewInput = z.discriminatedUnion("type", [
	checkInInput,
	quickSnapInput,
	fullReviewInput,
]);

const cursorInput = z.object({
	cursor: z.string().optional(),
	limit: z.number().min(1).max(50).default(20),
});

export const reviewRouter = router({
	create: protectedProcedure
		.input(createReviewInput)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// --- Guard clauses (outside transaction) ---

			// 1. Restaurant exists
			const restaurant = await ctx.db
				.select({
					id: restaurants.id,
					latitude: restaurants.latitude,
					longitude: restaurants.longitude,
				})
				.from(restaurants)
				.where(
					and(
						eq(restaurants.id, input.restaurantId),
						isNull(restaurants.deletedAt),
					),
				)
				.limit(1);

			if (restaurant.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Restaurant not found",
				});
			}

			// 2. GPS verification
			const distance = haversineDistance(
				input.latitude,
				input.longitude,
				restaurant[0]?.latitude ?? 0,
				restaurant[0]?.longitude ?? 0,
			);

			if (distance > GPS_MAX_DISTANCE_METERS) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Too far from restaurant (${Math.round(distance)}m). Must be within ${GPS_MAX_DISTANCE_METERS}m.`,
				});
			}

			// 3. Cooldown check (24h per restaurant)
			const cooldownCutoff = new Date(Date.now() - REVIEW_COOLDOWN_MS);
			const recentReview = await ctx.db
				.select({ id: reviews.id })
				.from(reviews)
				.where(
					and(
						eq(reviews.userId, userId),
						eq(reviews.restaurantId, input.restaurantId),
						gte(reviews.createdAt, cooldownCutoff),
						isNull(reviews.deletedAt),
					),
				)
				.limit(1);

			if (recentReview.length > 0) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "You already reviewed this restaurant in the last 24 hours",
				});
			}

			// 4. Daily review cap
			const todayStart = new Date();
			todayStart.setHours(0, 0, 0, 0);

			const dailyReviewCount = await ctx.db
				.select({ count: sql<number>`count(*)::int` })
				.from(reviews)
				.where(
					and(
						eq(reviews.userId, userId),
						gte(reviews.createdAt, todayStart),
						isNull(reviews.deletedAt),
					),
				);

			if ((dailyReviewCount[0]?.count ?? 0) >= DAILY_REVIEW_CAP) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: `Daily review limit reached (${DAILY_REVIEW_CAP})`,
				});
			}

			// --- Transaction ---
			const result = await ctx.db.transaction(async (tx) => {
				// Insert review
				const reviewValues: typeof reviews.$inferInsert = {
					userId,
					restaurantId: input.restaurantId,
					type: input.type,
					rating: input.rating,
					latitude: input.latitude,
					longitude: input.longitude,
				};

				if (input.type === "quick_snap") {
					reviewValues.photoUrl = input.photoUrl;
					reviewValues.emojis = input.emojis;
				} else if (input.type === "full_review") {
					reviewValues.content = input.content;
					reviewValues.photoUrl = input.photoUrl;
					reviewValues.extraPhotos = input.extraPhotos ?? [];
					reviewValues.tasteRating = input.tasteRating;
					reviewValues.serviceRating = input.serviceRating;
					reviewValues.ambianceRating = input.ambianceRating;
					reviewValues.valueRating = input.valueRating;
					reviewValues.emojis = input.emojis ?? [];
					reviewValues.tags = input.tags ?? [];
					reviewValues.pricePaid = input.pricePaid;
				}

				const [newReview] = await tx
					.insert(reviews)
					.values(reviewValues)
					.returning();

				if (!newReview) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create review",
					});
				}

				// Calculate points with daily cap
				const basePoints = POINTS_BY_REVIEW_TYPE[input.type];

				const dailyPointsResult = await tx
					.select({
						total: sql<number>`coalesce(sum(${pointsLog.points}), 0)::int`,
					})
					.from(pointsLog)
					.where(
						and(
							eq(pointsLog.userId, userId),
							gte(pointsLog.createdAt, todayStart),
						),
					);

				const dailyPointsSoFar = dailyPointsResult[0]?.total ?? 0;
				const pointsEarned = Math.min(
					basePoints,
					Math.max(0, DAILY_POINTS_CAP - dailyPointsSoFar),
				);

				// Insert points log
				if (pointsEarned > 0) {
					await tx.insert(pointsLog).values({
						userId,
						action: "review",
						points: pointsEarned,
						reason: `${input.type} review`,
						referenceId: newReview.id,
						referenceType: "review",
					});
				}

				// Update user_stats
				const currentStats = await tx
					.select()
					.from(userStats)
					.where(eq(userStats.userId, userId))
					.limit(1);

				const oldTotalPoints = currentStats[0]?.totalPoints ?? 0;
				const newTotalPoints = oldTotalPoints + pointsEarned;
				const oldLevel = currentStats[0]?.currentLevel ?? "apprenti";
				const newLevel = getLevelForPoints(newTotalPoints);

				await tx
					.update(userStats)
					.set({
						totalPoints: newTotalPoints,
						currentLevel: newLevel,
					})
					.where(eq(userStats.userId, userId));

				// Recalculate restaurant weighted score
				const allReviews = await tx
					.select({
						rating: reviews.rating,
						reviewUserId: reviews.userId,
					})
					.from(reviews)
					.where(
						and(
							eq(reviews.restaurantId, input.restaurantId),
							isNull(reviews.deletedAt),
						),
					);

				// Get each reviewer's level (approximate: current level, not level at review time)
				const reviewerIds = [...new Set(allReviews.map((r) => r.reviewUserId))];
				const reviewerStats =
					reviewerIds.length > 0
						? await tx
								.select()
								.from(userStats)
								.where(sql`${userStats.userId} IN ${reviewerIds}`)
						: [];

				const levelMap = new Map(
					reviewerStats.map((s) => [s.userId, s.currentLevel]),
				);

				const weightedReviews = allReviews.map((r) => ({
					rating: r.rating,
					level: levelMap.get(r.reviewUserId) ?? ("apprenti" as const),
				}));

				const weightedScore = calculateWeightedScore(weightedReviews);
				const averageScore =
					allReviews.length > 0
						? allReviews.reduce((acc, r) => acc + r.rating, 0) /
							allReviews.length
						: 0;

				await tx
					.insert(restaurantStats)
					.values({
						restaurantId: input.restaurantId,
						totalReviews: allReviews.length,
						totalHunts: allReviews.length,
						averageScore,
						weightedScore,
					})
					.onConflictDoUpdate({
						target: restaurantStats.restaurantId,
						set: {
							totalReviews: allReviews.length,
							totalHunts: allReviews.length,
							averageScore,
							weightedScore,
						},
					});

				return {
					review: newReview,
					pointsEarned,
					levelUp:
						oldLevel !== newLevel ? { from: oldLevel, to: newLevel } : null,
				};
			});

			return result;
		}),

	getByRestaurant: publicProcedure
		.input(z.object({ restaurantId: z.string() }).merge(cursorInput))
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(reviews.restaurantId, input.restaurantId),
				isNull(reviews.deletedAt),
			];

			if (input.cursor) {
				conditions.push(lt(reviews.createdAt, new Date(input.cursor)));
			}

			const rows = await ctx.db
				.select({
					id: reviews.id,
					userId: reviews.userId,
					type: reviews.type,
					rating: reviews.rating,
					content: reviews.content,
					photoUrl: reviews.photoUrl,
					extraPhotos: reviews.extraPhotos,
					emojis: reviews.emojis,
					tags: reviews.tags,
					tasteRating: reviews.tasteRating,
					serviceRating: reviews.serviceRating,
					ambianceRating: reviews.ambianceRating,
					valueRating: reviews.valueRating,
					pricePaid: reviews.pricePaid,
					createdAt: reviews.createdAt,
					userName: user.name,
					userImage: user.image,
					displayName: hunterProfiles.displayName,
					hunterLevel: userStats.currentLevel,
				})
				.from(reviews)
				.innerJoin(user, eq(user.id, reviews.userId))
				.leftJoin(hunterProfiles, eq(hunterProfiles.userId, reviews.userId))
				.leftJoin(userStats, eq(userStats.userId, reviews.userId))
				.where(and(...conditions))
				.orderBy(sql`${reviews.createdAt} DESC`)
				.limit(input.limit + 1);

			const hasMore = rows.length > input.limit;
			const items = hasMore ? rows.slice(0, input.limit) : rows;

			return {
				items,
				nextCursor: hasMore
					? items[items.length - 1]?.createdAt.toISOString()
					: undefined,
			};
		}),

	getByUser: publicProcedure
		.input(z.object({ userId: z.string() }).merge(cursorInput))
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(reviews.userId, input.userId),
				isNull(reviews.deletedAt),
			];

			if (input.cursor) {
				conditions.push(lt(reviews.createdAt, new Date(input.cursor)));
			}

			const rows = await ctx.db
				.select({
					id: reviews.id,
					restaurantId: reviews.restaurantId,
					restaurantName: restaurants.name,
					type: reviews.type,
					rating: reviews.rating,
					content: reviews.content,
					photoUrl: reviews.photoUrl,
					emojis: reviews.emojis,
					createdAt: reviews.createdAt,
				})
				.from(reviews)
				.innerJoin(restaurants, eq(restaurants.id, reviews.restaurantId))
				.where(and(...conditions))
				.orderBy(sql`${reviews.createdAt} DESC`)
				.limit(input.limit + 1);

			const hasMore = rows.length > input.limit;
			const items = hasMore ? rows.slice(0, input.limit) : rows;

			return {
				items,
				nextCursor: hasMore
					? items[items.length - 1]?.createdAt.toISOString()
					: undefined,
			};
		}),

	like: protectedProcedure
		.input(z.object({ reviewId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.insert(reviewLikes)
				.values({
					reviewId: input.reviewId,
					userId: ctx.session.user.id,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	unlike: protectedProcedure
		.input(z.object({ reviewId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(reviewLikes)
				.where(
					and(
						eq(reviewLikes.reviewId, input.reviewId),
						eq(reviewLikes.userId, ctx.session.user.id),
					),
				);

			return { success: true };
		}),

	report: protectedProcedure
		.input(
			z.object({
				reviewId: z.string(),
				reason: z.string().min(10).max(500),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(reviewReports).values({
				reviewId: input.reviewId,
				reporterId: ctx.session.user.id,
				reason: input.reason,
			});

			return { success: true };
		}),
});
