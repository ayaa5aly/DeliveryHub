export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'ar,en',
          'User-Agent': 'Tayar-App',
        },
      }
    );
    const data = await response.json();
    if (data && data.address) {
      const parts = [];
      const addr = data.address;
      
      const specific = addr.amenity || addr.building || addr.plaza || addr.road || addr.suburb;
      if (specific) parts.push(specific);
      
      const area = addr.neighbourhood || addr.suburb || addr.quarter;
      if (area && area !== specific) parts.push(area);
      
      const city = addr.city || addr.town || addr.village || addr.county;
      if (city) parts.push(city);
      
      const state = addr.state;
      if (state && state !== city) parts.push(state);

      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export interface MapSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export async function fetchAddressSuggestions(query: string, locale: string = 'ar'): Promise<MapSuggestion[]> {
  if (!query || query.trim().length < 3) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=EG&limit=5`,
      {
        headers: {
          'Accept-Language': `${locale === 'ar' ? 'ar' : 'en'},en`,
          'User-Agent': 'Tayar-App',
        },
      }
    );
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }));
    }
    return [];
  } catch (error) {
    console.error("Geocoding search failed:", error);
    return [];
  }
}
