import { describe, expect, test } from "bun:test";

import { getBoundingBox, haversineDistance } from "./haversine";

// ─── haversineDistance ───────────────────────────────────────────────────────

describe("haversineDistance", () => {
	test("same point → 0", () => {
		expect(haversineDistance(35.6812, 139.7671, 35.6812, 139.7671)).toBe(0);
	});

	test("Tokyo Station ↔ Shibuya Station ≈ 6,450m", () => {
		// Tokyo Station: 35.6812°N, 139.7671°E
		// Shibuya Station: 35.6580°N, 139.7016°E
		const distance = haversineDistance(35.6812, 139.7671, 35.658, 139.7016);
		expect(distance).toBeGreaterThan(6350);
		expect(distance).toBeLessThan(6550);
	});

	test("Paris ↔ Tokyo ≈ 9,700km", () => {
		// Paris: 48.8566°N, 2.3522°E
		// Tokyo: 35.6762°N, 139.6503°E
		const distance = haversineDistance(48.8566, 2.3522, 35.6762, 139.6503);
		expect(distance).toBeGreaterThan(9_650_000);
		expect(distance).toBeLessThan(9_750_000);
	});

	test("North Pole ↔ South Pole ≈ 20,015km", () => {
		const distance = haversineDistance(90, 0, -90, 0);
		expect(distance).toBeGreaterThan(20_000_000);
		expect(distance).toBeLessThan(20_030_000);
	});

	test("two points < 100m apart", () => {
		// ~50m shift in latitude at Tokyo
		const distance = haversineDistance(35.6812, 139.7671, 35.68165, 139.7671);
		expect(distance).toBeGreaterThan(40);
		expect(distance).toBeLessThan(60);
	});
});

// ─── getBoundingBox ──────────────────────────────────────────────────────────

describe("getBoundingBox", () => {
	const tokyoStation = { lat: 35.6812, lng: 139.7671 };

	test("center is inside the bounding box", () => {
		const box = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 100);
		expect(tokyoStation.lat).toBeGreaterThan(box.minLat);
		expect(tokyoStation.lat).toBeLessThan(box.maxLat);
		expect(tokyoStation.lng).toBeGreaterThan(box.minLng);
		expect(tokyoStation.lng).toBeLessThan(box.maxLng);
	});

	test("bounds are symmetric around center", () => {
		const box = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 100);
		const latDeltaMin = Math.abs(tokyoStation.lat - box.minLat);
		const latDeltaMax = Math.abs(box.maxLat - tokyoStation.lat);
		const lngDeltaMin = Math.abs(tokyoStation.lng - box.minLng);
		const lngDeltaMax = Math.abs(box.maxLng - tokyoStation.lng);

		expect(latDeltaMin).toBeCloseTo(latDeltaMax, 10);
		expect(lngDeltaMin).toBeCloseTo(lngDeltaMax, 10);
	});

	test("point just outside radius is outside bounding box", () => {
		const box = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 100);

		// A point ~150m north of Tokyo Station
		const farNorthLat = tokyoStation.lat + 0.00135;
		expect(farNorthLat).toBeGreaterThan(box.maxLat);
	});

	test("point inside radius is inside bounding box", () => {
		const box = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 100);

		// A point ~50m north of Tokyo Station
		const nearNorthLat = tokyoStation.lat + 0.00045;
		expect(nearNorthLat).toBeLessThan(box.maxLat);
		expect(nearNorthLat).toBeGreaterThan(box.minLat);
	});

	test("larger radius produces larger box", () => {
		const small = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 100);
		const large = getBoundingBox(tokyoStation.lat, tokyoStation.lng, 1000);

		expect(large.maxLat - large.minLat).toBeGreaterThan(
			small.maxLat - small.minLat,
		);
		expect(large.maxLng - large.minLng).toBeGreaterThan(
			small.maxLng - small.minLng,
		);
	});
});
