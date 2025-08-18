import { UserModel, AddressModel, PropertyModel, ListingModel } from '../models';
import { closePool } from '../database/config';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample addresses
    const address1 = await AddressModel.create({
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      latitude: 37.7749,
      longitude: -122.4194
    });

    const address2 = await AddressModel.create({
      street: '456 Oak Avenue',
      unit: 'Apt 2B',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90210',
      latitude: 34.0522,
      longitude: -118.2437
    });

    const address3 = await AddressModel.create({
      street: '789 Pine Street',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
      latitude: 47.6062,
      longitude: -122.3321
    });

    console.log('✅ Created sample addresses');

    // Create sample agent user
    const agent = await UserModel.create({
      email: 'agent@zestly.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Smith',
      phone: '+1-555-0123',
      role_id: 1 // agent role
    });

    // Create sample buyer user
    await UserModel.create({
      email: 'buyer@zestly.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Doe',
      phone: '+1-555-0124',
      role_id: 2 // buyer role
    });

    console.log('✅ Created sample users');

    // Create sample properties
    const property1 = await PropertyModel.create({
      address_id: address1.id,
      property_type: 'house',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      lot_size_sqft: 6000,
      year_built: 2015,
      parking_spaces: 2,
      features: ['hardwood floors', 'updated kitchen', 'backyard'],
      description: 'Beautiful modern home with stunning views of the city skyline.',
      hoa_fee: 0,
      property_tax_annual: 12000,
      zoning: 'R1',
      mls_number: 'MLS001'
    });

    const property2 = await PropertyModel.create({
      address_id: address2.id,
      property_type: 'condo',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      year_built: 2020,
      parking_spaces: 1,
      features: ['stainless appliances', 'in-unit laundry', 'balcony'],
      description: 'Luxury condo in prime location with modern amenities.',
      hoa_fee: 350,
      property_tax_annual: 8000,
      zoning: 'R3',
      mls_number: 'MLS002'
    });

    const property3 = await PropertyModel.create({
      address_id: address3.id,
      property_type: 'townhome',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      lot_size_sqft: 2000,
      year_built: 2018,
      parking_spaces: 2,
      features: ['granite countertops', 'fireplace', 'patio'],
      description: 'Spacious townhome perfect for families with private patio.',
      hoa_fee: 200,
      property_tax_annual: 15000,
      zoning: 'R2',
      mls_number: 'MLS003'
    });

    console.log('✅ Created sample properties');

    // Create sample listings
    await ListingModel.create({
      property_id: property1.id,
      agent_id: agent.id,
      listing_type_id: 1, // sale
      price: 850000,
      price_per_sqft: Math.round(850000 / 1800),
      virtual_tour_url: 'https://example.com/tour1',
      showing_instructions: 'Please remove shoes when entering.',
      private_remarks: 'Motivated seller, open to offers.'
    });

    await ListingModel.create({
      property_id: property2.id,
      agent_id: agent.id,
      listing_type_id: 1, // sale
      price: 650000,
      price_per_sqft: Math.round(650000 / 1200),
      virtual_tour_url: 'https://example.com/tour2',
      showing_instructions: 'Building concierge will provide access.',
      private_remarks: 'Price recently reduced.'
    });

    await ListingModel.create({
      property_id: property3.id,
      agent_id: agent.id,
      listing_type_id: 2, // rent
      price: 3500,
      price_per_sqft: Math.round(3500 / 2200),
      showing_instructions: 'Available for viewing weekends only.',
      private_remarks: 'Tenant must have excellent credit.'
    });

    console.log('✅ Created sample listings');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample users created:');
    console.log('📧 Agent: agent@zestly.com (password: password123)');
    console.log('📧 Buyer: buyer@zestly.com (password: password123)');
    console.log('\n📊 Sample data includes:');
    console.log('• 3 properties (house, condo, townhome)');
    console.log('• 3 listings (2 for sale, 1 for rent)');
    console.log('• Properties in San Francisco, Los Angeles, and Seattle');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}