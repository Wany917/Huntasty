import {
	menuItems,
	restaurantStats,
	restaurants,
} from "@Huntasty/db/schema/restaurants";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";
import { getBoundingBox, haversineDistance } from "../lib/haversine";

const cursorInput = z.object({
	cursor: z.string().optional(),
	limit: z.number().min(1).max(50).default(20),
});

export const restaurantRouter = router({
	list: publicProcedure
		.input(
			cursorInput.extend({
				city: z.string().optional(),
				cuisineType: z.string().optional(),
				status: z
					.enum(["imported", "created", "claimed", "verified", "partner"])
					.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [isNull(restaurants.deletedAt)];

			if (input.city) {
				conditions.push(eq(restaurants.city, input.city));
			}
			if (input.cuisineType) {
				conditions.push(eq(restaurants.cuisineType, input.cuisineType));
			}
			if (input.status) {
				conditions.push(eq(restaurants.status, input.status));
			}
			if (input.cursor) {
				conditions.push(gt(restaurants.id, input.cursor));
			}

			const rows = await ctx.db
				.select({
					id: restaurants.id,
					name: restaurants.name,
					latitude: restaurants.latitude,
					longitude: restaurants.longitude,
					status: restaurants.status,
					city: restaurants.city,
					cuisineType: restaurants.cuisineType,
					address: restaurants.address,
					priceRange: restaurants.priceRange,
					createdAt: restaurants.createdAt,
					weightedScore: restaurantStats.weightedScore,
					totalReviews: restaurantStats.totalReviews,
				})
				.from(restaurants)
				.leftJoin(
					restaurantStats,
					eq(restaurantStats.restaurantId, restaurants.id),
				)
				.where(and(...conditions))
				.orderBy(restaurants.id)
				.limit(input.limit + 1);

			const hasMore = rows.length > input.limit;
			const items = hasMore ? rows.slice(0, input.limit) : rows;

			return {
				items,
				nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
			};
		}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const restaurant = await ctx.db
				.select()
				.from(restaurants)
				.where(and(eq(restaurants.id, input.id), isNull(restaurants.deletedAt)))
				.limit(1);

			if (restaurant.length === 0) {
				return null;
			}

			const stats = await ctx.db
				.select()
				.from(restaurantStats)
				.where(eq(restaurantStats.restaurantId, input.id))
				.limit(1);

			const menu = await ctx.db
				.select()
				.from(menuItems)
				.where(
					and(
						eq(menuItems.restaurantId, input.id),
						eq(menuItems.isAvailable, true),
						isNull(menuItems.deletedAt),
					),
				);

			return {
				...restaurant[0],
				stats: stats[0] ?? null,
				menuItems: menu,
			};
		}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1).max(200),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const rows = await ctx.db
				.select({
					id: restaurants.id,
					name: restaurants.name,
					city: restaurants.city,
					cuisineType: restaurants.cuisineType,
					address: restaurants.address,
					latitude: restaurants.latitude,
					longitude: restaurants.longitude,
				})
				.from(restaurants)
				.where(
					and(
						isNull(restaurants.deletedAt),
						sql`to_tsvector('simple', ${restaurants.name}) @@ plainto_tsquery('simple', ${input.query})`,
					),
				)
				.limit(input.limit);

			return { items: rows };
		}),

	getNearby: publicProcedure
		.input(
			z.object({
				latitude: z.number().min(-90).max(90),
				longitude: z.number().min(-180).max(180),
				radiusMeters: z.number().min(100).max(50_000).default(1000),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			const bbox = getBoundingBox(
				input.latitude,
				input.longitude,
				input.radiusMeters,
			);

			const rows = await ctx.db
				.select({
					id: restaurants.id,
					name: restaurants.name,
					latitude: restaurants.latitude,
					longitude: restaurants.longitude,
					city: restaurants.city,
					cuisineType: restaurants.cuisineType,
					address: restaurants.address,
					priceRange: restaurants.priceRange,
					weightedScore: restaurantStats.weightedScore,
					totalReviews: restaurantStats.totalReviews,
				})
				.from(restaurants)
				.leftJoin(
					restaurantStats,
					eq(restaurantStats.restaurantId, restaurants.id),
				)
				.where(
					and(
						isNull(restaurants.deletedAt),
						sql`${restaurants.latitude} BETWEEN ${bbox.minLat} AND ${bbox.maxLat}`,
						sql`${restaurants.longitude} BETWEEN ${bbox.minLng} AND ${bbox.maxLng}`,
					),
				);

			const withDistance = rows
				.map((r) => ({
					...r,
					distance: haversineDistance(
						input.latitude,
						input.longitude,
						r.latitude,
						r.longitude,
					),
				}))
				.filter((r) => r.distance <= input.radiusMeters)
				.sort((a, b) => a.distance - b.distance)
				.slice(0, input.limit);

			return { items: withDistance };
		}),
});
