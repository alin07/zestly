import { Pool } from 'pg';
import { GeocodingService } from '../services/geocodingService';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zestly',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});


async function geocodeExistingAddresses() {
  try {
    console.log('🌍 Starting to geocode existing addresses...');

    // Find addresses without coordinates
    const { rows: addresses } = await pool.query(`
      SELECT id, street, unit, city, state, zip_code, country, latitude, longitude
      FROM addresses 
      WHERE latitude IS NULL OR longitude IS NULL
      ORDER BY id
    `);

    console.log(`Found ${addresses.length} addresses without coordinates`);

    if (addresses.length === 0) {
      console.log('✅ All addresses already have coordinates!');
      return;
    }

    let geocoded = 0;
    let failed = 0;

    for (const address of addresses) {
      console.log(`\n📍 Processing address ${address.id}: ${address.street}, ${address.city}, ${address.state}`);

      try {
        const result = await GeocodingService.geocodeAddress(
          address.street,
          address.unit,
          address.city,
          address.state,
          address.zip_code,
          address.country || 'USA'
        );

        if (result) {
          // Update the address with coordinates
          await pool.query(
            'UPDATE addresses SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            [result.latitude, result.longitude, address.id]
          );
          
          console.log(`✅ Successfully geocoded: ${result.latitude}, ${result.longitude}`);
          geocoded++;
        } else {
          console.log('❌ Failed to geocode this address');
          failed++;
        }

        // Respect rate limits (1 request per second)
        if (addresses.indexOf(address) < addresses.length - 1) {
          console.log('⏳ Waiting 1.1 seconds...');
          await new Promise(resolve => setTimeout(resolve, 1100));
        }

      } catch (error) {
        console.error(`❌ Error geocoding address ${address.id}:`, error);
        failed++;
      }
    }

    console.log(`\n🎉 Geocoding complete!`);
    console.log(`✅ Successfully geocoded: ${geocoded} addresses`);
    console.log(`❌ Failed to geocode: ${failed} addresses`);

  } catch (error) {
    console.error('❌ Error in geocoding script:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
geocodeExistingAddresses();