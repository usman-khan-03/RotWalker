/**
 * Distance calculation utilities
 * Uses Haversine formula for great-circle distance
 */

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/**
 * Validate that a journey distance meets minimum requirements
 * Crew journeys must be at least 50 miles (80 km)
 */
export function validateCrewJourneyDistance(distanceKm: number): {
  valid: boolean;
  error?: string;
} {
  const MIN_DISTANCE_KM = 80; // 50 miles
  if (distanceKm < MIN_DISTANCE_KM) {
    return {
      valid: false,
      error: `Crew journeys must be at least ${MIN_DISTANCE_KM} km (50 miles). Current distance: ${distanceKm.toFixed(1)} km`,
    };
  }
  return { valid: true };
}

