import { protectedProcedure, publicProcedure, router } from "../index";

import { hunterRouter } from "./hunter";
import { leaderboardRouter } from "./leaderboard";
import { restaurantRouter } from "./restaurant";
import { reviewRouter } from "./review";
import { socialRouter } from "./social";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	hunter: hunterRouter,
	restaurant: restaurantRouter,
	review: reviewRouter,
	social: socialRouter,
	leaderboard: leaderboardRouter,
});
export type AppRouter = typeof appRouter;
