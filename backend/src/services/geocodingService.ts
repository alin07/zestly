// Using built-in fetch (Node.js 18+)

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

export class GeocodingService {
  private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/search';
  private static readonly USER_AGENT = 'Zestly Real Estate App';

  static async geocodeAddress(
    street?: string,
    unit?: string,
    city?: string,
    state?: string,
    zipCode?: string,
    country: string = 'USA'
  ): Promise<GeocodeResult | null> {
    try {
      // Try with unit first, then without if it fails
      const attempts: string[][] = [];
      
      // First attempt: with unit if provided
      if (unit) {
        attempts.push([`${street} ${unit}`, city, state, zipCode, country].filter(Boolean) as string[]);
      }
      
      // Second attempt: without unit
      attempts.push([street, city, state, zipCode, country].filter(Boolean) as string[]);

      for (const addressParts of attempts) {
        if (addressParts.length === 0) continue;

        const addressString = addressParts.join(', ');
        
        // Nominatim API request
        const url = new URL(this.BASE_URL);
        url.searchParams.set('format', 'json');
        url.searchParams.set('q', addressString);
        url.searchParams.set('limit', '1');
        url.searchParams.set('countrycodes', 'us'); // Limit to US for better accuracy

        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': this.USER_AGENT,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Geocoding API error:', response.status, response.statusText);
          continue;
        }

        const data = await response.json() as NominatimResponse[];

        if (data && data.length > 0) {
          const result = data[0];
          const latitude = parseFloat(result.lat);
          const longitude = parseFloat(result.lon);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            console.log(`Geocoded "${addressString}" to: ${latitude}, ${longitude}`);
            return { latitude, longitude };
          }
        }

        console.warn('No geocoding results found for address:', addressString);
        
        // Add delay between attempts
        if (attempts.indexOf(addressParts) < attempts.length - 1) {
          await this.delay(1100);
        }
      }

      console.warn('Failed to geocode address after all attempts');
      return null;

    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Helper method to add delay between requests (respect rate limits)
  static async delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch geocode multiple addresses with rate limiting
  static async geocodeAddresses(addresses: Array<{
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }>): Promise<Array<GeocodeResult | null>> {
    const results: Array<GeocodeResult | null> = [];
    
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      const result = await this.geocodeAddress(
        address.street,
        address.unit,
        address.city,
        address.state,
        address.zipCode,
        address.country
      );
      
      results.push(result);
      
      // Add delay between requests to respect rate limits (1 req/sec)
      if (i < addresses.length - 1) {
        await this.delay(1100); // 1.1 seconds to be safe
      }
    }
    
    return results;
  }
}