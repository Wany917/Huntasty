import { user } from "@Huntasty/db/schema/auth";
import { hunterProfiles } from "@Huntasty/db/schema/hunters";
import { leaderboardEntries } from "@Huntasty/db/schema/leaderboards";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";

export const leaderboardRouter = router({
	get: publicProcedure
		.input(
			z.object({
				scope: z.enum(["global", "city", "clan"]),
				period: z.enum(["weekly", "monthly", "all_time"]),
				city: z.string().optional(),
				cursor: z.number().int().min(0).optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(leaderboardEntries.scope, input.scope),
				eq(leaderboardEntries.period, input.period),
			];

			if (input.city) {
				conditions.push(eq(leaderboardEntries.city, input.city));
			}

			if (input.cursor !== undefined) {
				conditions.push(gt(leaderboardEntries.rank, input.cursor));
			}

			const rows = await ctx.db
				.select({
					rank: leaderboardEntries.rank,
					points: leaderboardEntries.points,
					userId: leaderboardEntries.userId,
					name: user.name,
					image: user.image,
					displayName: hunterProfiles.displayName,
				})
				.from(leaderboardEntries)
				.innerJoin(user, eq(user.id, leaderboardEntries.userId))
				.leftJoin(
					hunterProfiles,
					eq(hunterProfiles.userId, leaderboardEntries.userId),
				)
				.where(and(...conditions))
				.orderBy(leaderboardEntries.rank)
				.limit(input.limit + 1);

			const hasMore = rows.length > input.limit;
			const items = hasMore ? rows.slice(0, input.limit) : rows;

			return {
				items,
				nextCursor: hasMore ? items[items.length - 1]?.rank : undefined,
			};
		}),
});
