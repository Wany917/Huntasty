const EARTH_RADIUS_METERS = 6_371_000;

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

export function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getBoundingBox(
	centerLat: number,
	centerLng: number,
	radiusMeters: number,
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
	const latDelta = (radiusMeters / EARTH_RADIUS_METERS) * (180 / Math.PI);
	const lngDelta =
		((radiusMeters / EARTH_RADIUS_METERS) * (180 / Math.PI)) /
		Math.cos(toRad(centerLat));

	return {
		minLat: centerLat - latDelta,
		maxLat: centerLat + latDelta,
		minLng: centerLng - lngDelta,
		maxLng: centerLng + lngDelta,
	};
}
