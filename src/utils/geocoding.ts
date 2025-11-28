/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 */

export interface CityResult {
  display_name: string;
  lat: number;
  lon: number;
  city: string;
  state?: string;
  country: string;
}

/**
 * Search for cities using OpenStreetMap Nominatim API
 * Returns a list of city results with coordinates
 */
export async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Use Nominatim API with city-specific search
    // Remove featuretype restriction to get better results
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RotWalker/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search cities');
    }

    const data = await response.json();

    return data
      .filter((item: any) => {
        // Filter to only include places that have address details
        // Accept cities, towns, villages, municipalities, and administrative areas
        if (!item.address) return false;
        
        const address = item.address;
        const hasCityName = !!(address.city || address.town || address.village || address.municipality);
        const hasCountry = !!address.country;
        
        return hasCityName && hasCountry;
      })
      .map((item: any) => {
        const address = item.address || {};
        return {
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          city: address.city || address.town || address.village || address.municipality || address.county || '',
          state: address.state || address.region || address.province || undefined,
          country: address.country || '',
        };
      })
      .filter((result: CityResult) => result.city && result.country) // Ensure we have city and country
      .slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

/**
 * Geocode a specific city name to get coordinates
 * Returns the first result or null if not found
 */
export async function geocodeCity(cityName: string): Promise<CityResult | null> {
  const results = await searchCities(cityName);
  return results.length > 0 ? results[0] : null;
}

