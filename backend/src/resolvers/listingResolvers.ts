import { ListingModel, AnalyticsModel, FavoritesModel, AddressModel, PropertyModel } from '../models';
import { GraphQLContext } from '../types';
import { query, withTransaction } from '../database/config';


const listingResolvers = {
  Query: {
    listings: async (
      _: any,
      { filters = {}, limit = 20, offset = 0 }: {
        filters?: any;
        limit?: number;
        offset?: number;
      }
    ) => {
      const listings = await ListingModel.findAll(filters, limit, offset);
      return listings;
    },

    listing: async (_: any, { id }: { id: string }) => {
      const listing = await ListingModel.findById(parseInt(id));
      if (!listing) {
        throw new Error('Listing not found');
      }
      return listing;
    },

    featuredListings: async (_: any, { limit = 10 }: { limit?: number }) => {
      return await ListingModel.getFeatured(limit);
    },

    searchListings: async (
      _: any,
      { filters = {}, limit = 20, offset = 0 }: {
        filters: any;
        limit?: number;
        offset?: number;
      }
    ) => {
      return await ListingModel.findAll(filters, limit, offset);
    },
  },

  Mutation: {
    createListing: async (
      _: any,
      { input }: { input: any },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can create listings');
      }

      console.log('Creating listing with user:', { id: user.id, firstName: user.first_name, lastName: user.last_name });

      // Use transaction to ensure all-or-nothing behavior
      const listing = await withTransaction(async (client) => {
        // Step 1: Create address
        const address = await AddressModel.createWithClient(client, {
          street: input.address.street,
          unit: input.address.unit,
          city: input.address.city,
          state: input.address.state,
          zip_code: input.address.zipCode,
          country: input.address.country || 'United States',
          latitude: input.address.latitude,
          longitude: input.address.longitude,
        });

        console.log('Created address:', address);

        // Step 2: Create property
        const property = await PropertyModel.createWithClient(client, {
          address_id: address.id,
          property_type: input.property.propertyType.toLowerCase(),
          bedrooms: input.property.bedrooms,
          bathrooms: input.property.bathrooms,
          sqft: input.property.sqft,
          lot_size_sqft: input.property.lotSizeSqft,
          year_built: input.property.yearBuilt,
          parking_spaces: input.property.parkingSpaces,
          features: input.property.features || [],
          description: input.property.description,
          hoa_fee: input.property.hoaFee,
          property_tax_annual: input.property.propertyTaxAnnual,
          zoning: input.property.zoning,
          mls_number: input.property.mlsNumber,
        });

        console.log('Created property:', property);

        // Step 3: Create listing
        const newListing = await ListingModel.createWithClient(client, {
          property_id: property.id,
          agent_id: user.id,
          listing_type_id: parseInt(input.listingTypeId),
          price: input.price,
          price_per_sqft: input.pricePerSqft,
          virtual_tour_url: input.virtualTourUrl,
          showing_instructions: input.showingInstructions,
          private_remarks: input.privateRemarks
        });

        console.log('Created listing:', newListing);

        return newListing;
      });

      // Return the full listing with all joined data
      const fullListing = await ListingModel.findById(listing.id);
      console.log('Full listing with agent data:', JSON.stringify(fullListing, null, 2));

      return fullListing;
    },

    createCompleteListing: async (
      _: any,
      { input }: { input: any },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can create listings');
      }

      console.log('Creating complete listing with user:', { id: user.id, firstName: user.first_name, lastName: user.last_name });

      // Use transaction to ensure all-or-nothing behavior
      const listing = await withTransaction(async (client) => {
        // Step 1: Create address
        const address = await AddressModel.createWithClient(client, {
          street: input.address.street,
          unit: input.address.unit,
          city: input.address.city,
          state: input.address.state,
          zip_code: input.address.zipCode,
          country: input.address.country || 'United States',
          latitude: input.address.latitude,
          longitude: input.address.longitude,
        });

        console.log('Created address:', address);

        // Step 2: Create property
        const property = await PropertyModel.createWithClient(client, {
          address_id: address.id,
          property_type: input.property.propertyType.toLowerCase(),
          bedrooms: input.property.bedrooms,
          bathrooms: input.property.bathrooms,
          sqft: input.property.sqft,
          lot_size_sqft: input.property.lotSizeSqft,
          year_built: input.property.yearBuilt,
          parking_spaces: input.property.parkingSpaces,
          features: input.property.features || [],
          description: input.property.description,
          hoa_fee: input.property.hoaFee,
          property_tax_annual: input.property.propertyTaxAnnual,
          zoning: input.property.zoning,
          mls_number: input.property.mlsNumber,
        });

        console.log('Created property:', property);

        // Step 3: Create listing
        const newListing = await ListingModel.createWithClient(client, {
          property_id: property.id,
          agent_id: user.id,
          listing_type_id: parseInt(input.listingTypeId),
          price: input.price,
          price_per_sqft: input.pricePerSqft,
          virtual_tour_url: input.virtualTourUrl,
          showing_instructions: input.showingInstructions,
          private_remarks: input.privateRemarks
        });

        console.log('Created listing:', newListing);

        return newListing;
      });

      // Return the full listing with all joined data
      const fullListing = await ListingModel.findById(listing.id);
      console.log('Full listing with agent data:', JSON.stringify(fullListing, null, 2));

      return fullListing;
    },

    updateListing: async (
      _: any,
      { id, input }: { id: string; input: any },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can update listings');
      }

      const existingListing = await ListingModel.findById(parseInt(id));
      if (!existingListing || existingListing.agent_id !== user.id) {
        throw new Error('Listing not found or unauthorized');
      }

      const updates: any = {};
      if (input.propertyId !== undefined) updates.property_id = parseInt(input.propertyId);
      if (input.listingTypeId !== undefined) updates.listing_type_id = parseInt(input.listingTypeId);
      if (input.price !== undefined) updates.price = input.price;
      if (input.pricePerSqft !== undefined) updates.price_per_sqft = input.pricePerSqft;
      if (input.virtualTourUrl !== undefined) updates.virtual_tour_url = input.virtualTourUrl;
      if (input.showingInstructions !== undefined) updates.showing_instructions = input.showingInstructions;
      if (input.privateRemarks !== undefined) updates.private_remarks = input.privateRemarks;

      await ListingModel.update(parseInt(id), updates);

      return await ListingModel.findById(parseInt(id));
    },

    updateListingStatus: async (
      _: any,
      { id, statusId }: { id: string; statusId: string },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can update listing status');
      }

      const existingListing = await ListingModel.findById(parseInt(id));
      if (!existingListing || existingListing.agent_id !== user.id) {
        throw new Error('Listing not found or unauthorized');
      }

      await ListingModel.updateStatus(parseInt(id), parseInt(statusId));
      return await ListingModel.findById(parseInt(id));
    },

    deleteListing: async (
      _: any,
      { id }: { id: string },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can delete listings');
      }

      const existingListing = await ListingModel.findById(parseInt(id));
      if (!existingListing || existingListing.agent_id !== user.id) {
        throw new Error('Listing not found or unauthorized');
      }

      return await ListingModel.delete(parseInt(id));
    },

    addToFavorites: async (
      _: any,
      { listingId }: { listingId: string },
      { user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      return await FavoritesModel.addFavorite(user.id, parseInt(listingId));
    },

    removeFromFavorites: async (
      _: any,
      { listingId }: { listingId: string },
      { user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      return await FavoritesModel.removeFavorite(user.id, parseInt(listingId));
    },

    recordListingView: async (
      _: any,
      { listingId, sessionId }: { listingId: string; sessionId?: string },
      { user, req }: GraphQLContext
    ) => {
      const ipAddress = req?.ip || req?.connection?.remoteAddress;
      const userAgent = req?.get('User-Agent');

      await AnalyticsModel.recordListingView(
        parseInt(listingId),
        user?.id,
        sessionId,
        ipAddress,
        userAgent
      );

      return true;
    },
  },

  Listing: {
    // Convert database fields to GraphQL schema fields
    pricePerSqft: (parent: any) => parent.price_per_sqft,
    virtualTourUrl: (parent: any) => parent.virtual_tour_url,
    showingInstructions: (parent: any) => parent.showing_instructions,
    privateRemarks: (parent: any) => parent.private_remarks,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    views: async (parent: any) => {
      return await AnalyticsModel.getListingViews(parent.id);
    },

    isFavorited: async (parent: any, _: any, { user }: GraphQLContext) => {
      if (!user) return false;
      return await FavoritesModel.isFavorited(user.id, parent.id);
    },

    // Nested resolvers - these come from the JOIN in the query
    property: (parent: any) => ({
      id: parent.property_id || parent.id,
      propertyType: parent.property_type,
      bedrooms: parent.bedrooms,
      bathrooms: parent.bathrooms,
      sqft: parent.sqft,
      lotSizeSqft: parent.lot_size_sqft,
      yearBuilt: parent.year_built,
      parkingSpaces: parent.parking_spaces,
      features: parent.features,
      description: parent.description,
      hoaFee: parent.hoa_fee,
      propertyTaxAnnual: parent.property_tax_annual,
      zoning: parent.zoning,
      mlsNumber: parent.mls_number,
      createdAt: parent.created_at,
      updatedAt: parent.updated_at,
      // Include address fields at property level for the Property type's address resolver
      address_id: parent.address_id,
      street: parent.street,
      unit: parent.unit,
      city: parent.city,
      state: parent.state,
      zip_code: parent.zip_code,
      country: parent.country,
      latitude: parent.latitude,
      longitude: parent.longitude
    }),

    agent: (parent: any) => ({
      id: parent.agent_id,
      // Use the joined data but map it to database field names so User resolver can process it
      first_name: parent.agent_first_name || 'Unknown',
      last_name: parent.agent_last_name || 'Agent',
      email: parent.agent_email || 'unknown@example.com',
      role_id: parent.agent_role_id || 2, // Default to agent role ID
      is_verified: parent.agent_is_verified || false,
      is_active: parent.agent_is_active || true,
      created_at: parent.agent_created_at || new Date().toISOString(),
      updated_at: parent.agent_updated_at || new Date().toISOString()
    }),

    listingType: (parent: any) => ({
      id: parent.listing_type_id,
      name: parent.listing_type_name || 'unknown',
      description: parent.listing_type_description,
      created_at: parent.listing_type_created_at || new Date().toISOString(),
      updated_at: parent.listing_type_updated_at || new Date().toISOString()
    }),

    status: (parent: any) => ({
      id: parent.status_id,
      name: parent.status_name || 'unknown',
      description: parent.status_description,
      is_active: parent.status_is_active !== undefined ? parent.status_is_active : true,
      created_at: parent.status_created_at || new Date().toISOString(),
      updated_at: parent.status_updated_at || new Date().toISOString()
    }),

    openHouses: async (parent: any) => {
      // Fetch open houses for this listing
      const result = await query(`
        SELECT * FROM open_houses
        WHERE listing_id = $1 AND is_cancelled = false
        ORDER BY open_house_date ASC, start_time ASC
      `, [parent.id]);

      return result.rows.map((oh: any) => ({
        id: oh.id,
        listingId: oh.listing_id,
        date: oh.open_house_date,
        startTime: oh.start_time,
        endTime: oh.end_time,
        description: oh.description,
        isCancelled: oh.is_cancelled,
        createdAt: oh.created_at,
        updatedAt: oh.updated_at
      }));
    },
  },
};

export default listingResolvers;