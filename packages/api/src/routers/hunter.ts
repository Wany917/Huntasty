import { user } from "@Huntasty/db/schema/auth";
import { hunterProfiles, userStats } from "@Huntasty/db/schema/hunters";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

export const hunterRouter = router({
	getMyProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const profile = await ctx.db
			.select({
				userId: hunterProfiles.userId,
				displayName: hunterProfiles.displayName,
				phoneNumber: hunterProfiles.phoneNumber,
				city: hunterProfiles.city,
				createdAt: hunterProfiles.createdAt,
				name: user.name,
				email: user.email,
				image: user.image,
			})
			.from(hunterProfiles)
			.innerJoin(user, eq(user.id, hunterProfiles.userId))
			.where(eq(hunterProfiles.userId, userId))
			.limit(1);

		if (profile.length === 0) {
			return null;
		}

		const stats = await ctx.db
			.select()
			.from(userStats)
			.where(eq(userStats.userId, userId))
			.limit(1);

		return {
			...profile[0],
			stats: stats[0] ?? null,
		};
	}),

	getProfile: publicProcedure
		.input(z.object({ userId: z.string() }))
		.query(async ({ ctx, input }) => {
			const profile = await ctx.db
				.select({
					userId: hunterProfiles.userId,
					displayName: hunterProfiles.displayName,
					city: hunterProfiles.city,
					createdAt: hunterProfiles.createdAt,
					name: user.name,
					image: user.image,
				})
				.from(hunterProfiles)
				.innerJoin(user, eq(user.id, hunterProfiles.userId))
				.where(eq(hunterProfiles.userId, input.userId))
				.limit(1);

			if (profile.length === 0) {
				return null;
			}

			const stats = await ctx.db
				.select({
					totalPoints: userStats.totalPoints,
					currentLevel: userStats.currentLevel,
					streakDays: userStats.streakDays,
					streakBadge: userStats.streakBadge,
				})
				.from(userStats)
				.where(eq(userStats.userId, input.userId))
				.limit(1);

			return {
				...profile[0],
				stats: stats[0] ?? null,
			};
		}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				displayName: z.string().min(1).max(50).optional(),
				city: z.string().min(1).max(100).optional(),
				phoneNumber: z.string().min(5).max(20).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const updated = await ctx.db
				.update(hunterProfiles)
				.set(input)
				.where(eq(hunterProfiles.userId, userId))
				.returning();

			return updated[0] ?? null;
		}),
});
