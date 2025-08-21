import { query } from '../database/config';

async function cleanupOrphanedData() {
  console.log('🧹 Starting cleanup of orphaned data...');

  try {
    // Find orphaned addresses (addresses not referenced by any property)
    const orphanedAddresses = await query(`
      SELECT a.id, a.street, a.city 
      FROM addresses a 
      LEFT JOIN properties p ON a.id = p.address_id 
      WHERE p.id IS NULL
    `);

    if (orphanedAddresses.rows.length > 0) {
      console.log(`Found ${orphanedAddresses.rows.length} orphaned addresses:`);
      orphanedAddresses.rows.forEach(addr => {
        console.log(`  - ID ${addr.id}: ${addr.street}, ${addr.city}`);
      });

      // Delete orphaned addresses
      const deleteAddresses = await query(`
        DELETE FROM addresses 
        WHERE id IN (
          SELECT a.id 
          FROM addresses a 
          LEFT JOIN properties p ON a.id = p.address_id 
          WHERE p.id IS NULL
        )
      `);
      console.log(`✅ Deleted ${deleteAddresses.rowCount} orphaned addresses`);
    } else {
      console.log('✅ No orphaned addresses found');
    }

    // Find orphaned properties (properties not referenced by any listing)
    const orphanedProperties = await query(`
      SELECT p.id, p.property_type, a.street, a.city
      FROM properties p 
      JOIN addresses a ON p.address_id = a.id
      LEFT JOIN listings l ON p.id = l.property_id 
      WHERE l.id IS NULL
    `);

    if (orphanedProperties.rows.length > 0) {
      console.log(`Found ${orphanedProperties.rows.length} orphaned properties:`);
      orphanedProperties.rows.forEach(prop => {
        console.log(`  - ID ${prop.id}: ${prop.property_type} at ${prop.street}, ${prop.city}`);
      });

      // Get the address IDs of properties we're about to delete
      const addressIds = orphanedProperties.rows.map(p => p.address_id);

      // Delete orphaned properties
      const deleteProperties = await query(`
        DELETE FROM properties 
        WHERE id IN (
          SELECT p.id 
          FROM properties p 
          LEFT JOIN listings l ON p.id = l.property_id 
          WHERE l.id IS NULL
        )
      `);
      console.log(`✅ Deleted ${deleteProperties.rowCount} orphaned properties`);

      // Now delete the associated addresses
      if (addressIds.length > 0) {
        const deleteAssociatedAddresses = await query(`
          DELETE FROM addresses 
          WHERE id = ANY($1)
        `, [addressIds]);
        console.log(`✅ Deleted ${deleteAssociatedAddresses.rowCount} associated addresses`);
      }
    } else {
      console.log('✅ No orphaned properties found');
    }

    // Show summary of remaining data
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM addresses) as addresses_count,
        (SELECT COUNT(*) FROM properties) as properties_count,
        (SELECT COUNT(*) FROM listings) as listings_count
    `);

    console.log('\n📊 Current data summary:');
    console.log(`  - Addresses: ${summary.rows[0].addresses_count}`);
    console.log(`  - Properties: ${summary.rows[0].properties_count}`);
    console.log(`  - Listings: ${summary.rows[0].listings_count}`);

    console.log('\n🎉 Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupOrphanedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default cleanupOrphanedData;