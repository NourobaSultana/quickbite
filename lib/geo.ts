/**
 * Returns the straight-line (haversine) distance between two
 * lat/lng points in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const EARTH_RADIUS_KM = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Rough ETA estimate assuming an average city delivery speed
 * of 25 km/h. Good enough for a live "X min away" indicator
 * without needing a routing API.
 */
export function estimateEtaMinutes(distanceKm: number): number {
  const AVERAGE_SPEED_KMH = 25;
  return Math.max(1, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));
}
