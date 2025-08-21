import { query, withTransaction } from '../database/config';

async function deletePropertiesWithoutZipCodes() {
  console.log('🗑️  Starting deletion of properties without zip codes...');

  try {
    await withTransaction(async (client) => {
      // First, let's see what we're about to delete
      const checkResult = await client.query(`
        SELECT 
          l.id as listing_id,
          p.id as property_id, 
          a.id as address_id,
          a.street,
          a.city,
          a.state,
          a.zip_code
        FROM listings l
        JOIN properties p ON l.property_id = p.id
        JOIN addresses a ON p.address_id = a.id
        WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
      `);

      if (checkResult.rows.length === 0) {
        console.log('✅ No properties found without zip codes. Nothing to delete.');
        return;
      }

      console.log(`Found ${checkResult.rows.length} properties without zip codes:`);
      checkResult.rows.forEach(row => {
        console.log(`  - Property ${row.property_id} (Listing ${row.listing_id}): ${row.street}, ${row.city}, ${row.state} - ZIP: '${row.zip_code}'`);
      });

      console.log('\n🗑️  Deleting related data...');

      // Delete listing views for affected listings
      const deleteViews = await client.query(`
        DELETE FROM listing_views 
        WHERE listing_id IN (
          SELECT l.id 
          FROM listings l
          JOIN properties p ON l.property_id = p.id
          JOIN addresses a ON p.address_id = a.id
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteViews.rowCount} listing views`);

      // Delete favorites for affected listings
      const deleteFavorites = await client.query(`
        DELETE FROM favorites 
        WHERE listing_id IN (
          SELECT l.id 
          FROM listings l
          JOIN properties p ON l.property_id = p.id
          JOIN addresses a ON p.address_id = a.id
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteFavorites.rowCount} favorites`);

      // Delete open houses for affected listings
      const deleteOpenHouses = await client.query(`
        DELETE FROM open_houses 
        WHERE listing_id IN (
          SELECT l.id 
          FROM listings l
          JOIN properties p ON l.property_id = p.id
          JOIN addresses a ON p.address_id = a.id
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteOpenHouses.rowCount} open houses`);

      // Delete property images for affected properties
      const deleteImages = await client.query(`
        DELETE FROM property_images 
        WHERE property_id IN (
          SELECT p.id 
          FROM properties p
          JOIN addresses a ON p.address_id = a.id
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteImages.rowCount} property images`);

      // Delete listings for affected properties
      const deleteListings = await client.query(`
        DELETE FROM listings 
        WHERE property_id IN (
          SELECT p.id 
          FROM properties p
          JOIN addresses a ON p.address_id = a.id
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteListings.rowCount} listings`);

      // Delete properties with no zip codes
      const deleteProperties = await client.query(`
        DELETE FROM properties 
        WHERE address_id IN (
          SELECT a.id 
          FROM addresses a
          WHERE a.zip_code IS NULL OR a.zip_code = '' OR TRIM(a.zip_code) = ''
        )
      `);
      console.log(`  ✅ Deleted ${deleteProperties.rowCount} properties`);

      // Delete addresses with no zip codes
      const deleteAddresses = await client.query(`
        DELETE FROM addresses 
        WHERE zip_code IS NULL OR zip_code = '' OR TRIM(zip_code) = ''
      `);
      console.log(`  ✅ Deleted ${deleteAddresses.rowCount} addresses`);

      // Show summary of what remains
      const summary = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM addresses) as remaining_addresses,
          (SELECT COUNT(*) FROM properties) as remaining_properties,
          (SELECT COUNT(*) FROM listings) as remaining_listings,
          (SELECT COUNT(*) FROM listing_views) as remaining_listing_views,
          (SELECT COUNT(*) FROM favorites) as remaining_favorites
      `);

      console.log('\n📊 Database summary after deletion:');
      const summaryData = summary.rows[0];
      console.log(`  - Addresses: ${summaryData.remaining_addresses}`);
      console.log(`  - Properties: ${summaryData.remaining_properties}`);
      console.log(`  - Listings: ${summaryData.remaining_listings}`);
      console.log(`  - Listing Views: ${summaryData.remaining_listing_views}`);
      console.log(`  - Favorites: ${summaryData.remaining_favorites}`);

      console.log('\n🎉 Deletion completed successfully!');
    });
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    throw error;
  }
}

// Run the deletion if this script is executed directly
if (require.main === module) {
  deletePropertiesWithoutZipCodes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default deletePropertiesWithoutZipCodes;