import { db } from "@Huntasty/db";
import * as schema from "@Huntasty/db/schema/auth";
import { hunterProfiles, userStats } from "@Huntasty/db/schema/hunters";
import { env } from "@Huntasty/env/server";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [
		env.CORS_ORIGIN,
		"Huntasty://",
		...(env.NODE_ENV === "development"
			? [
					"exp://",
					"exp://**",
					"exp://192.168.*.*:*/**",
					"http://localhost:8081",
				]
			: []),
	],
	emailAndPassword: {
		enabled: true,
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					try {
						await db.insert(hunterProfiles).values({
							userId: user.id,
							city: "tokyo",
						});
						await db.insert(userStats).values({
							userId: user.id,
						});
					} catch (error) {
						console.error(
							"[auth] Failed to create hunter profile/stats for user:",
							user.id,
							error,
						);
					}
				},
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [expo()],
});
