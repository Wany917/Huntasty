import { user } from "@Huntasty/db/schema/auth";
import { hunterProfiles } from "@Huntasty/db/schema/hunters";
import { follows } from "@Huntasty/db/schema/social";
import { TRPCError } from "@trpc/server";
import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

const cursorInput = z.object({
	cursor: z.string().datetime().optional(),
	limit: z.number().min(1).max(50).default(20),
});

export const socialRouter = router({
	follow: protectedProcedure
		.input(z.object({ targetUserId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			if (userId === input.targetUserId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot follow yourself",
				});
			}

			await ctx.db
				.insert(follows)
				.values({
					followerId: userId,
					followingId: input.targetUserId,
				})
				.onConflictDoNothing();

			return { success: true };
		}),

	unfollow: protectedProcedure
		.input(z.object({ targetUserId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(follows)
				.where(
					and(
						eq(follows.followerId, ctx.session.user.id),
						eq(follows.followingId, input.targetUserId),
					),
				);

			return { success: true };
		}),

	getFollowers: publicProcedure
		.input(z.object({ userId: z.string() }).merge(cursorInput))
		.query(async ({ ctx, input }) => {
			const rows = await ctx.db
				.select({
					followerId: follows.followerId,
					createdAt: follows.createdAt,
					name: user.name,
					image: user.image,
					displayName: hunterProfiles.displayName,
				})
				.from(follows)
				.innerJoin(user, eq(user.id, follows.followerId))
				.leftJoin(hunterProfiles, eq(hunterProfiles.userId, follows.followerId))
				.where(
					and(
						eq(follows.followingId, input.userId),
						input.cursor
							? lt(follows.createdAt, new Date(input.cursor))
							: undefined,
					),
				)
				.orderBy(follows.createdAt)
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

	getFollowing: publicProcedure
		.input(z.object({ userId: z.string() }).merge(cursorInput))
		.query(async ({ ctx, input }) => {
			const rows = await ctx.db
				.select({
					followingId: follows.followingId,
					createdAt: follows.createdAt,
					name: user.name,
					image: user.image,
					displayName: hunterProfiles.displayName,
				})
				.from(follows)
				.innerJoin(user, eq(user.id, follows.followingId))
				.leftJoin(
					hunterProfiles,
					eq(hunterProfiles.userId, follows.followingId),
				)
				.where(
					and(
						eq(follows.followerId, input.userId),
						input.cursor
							? lt(follows.createdAt, new Date(input.cursor))
							: undefined,
					),
				)
				.orderBy(follows.createdAt)
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
});
