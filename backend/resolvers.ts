import pool from './db';

interface Context {
  user?: any; // Will be populated by auth middleware
}

export const resolvers = {
  Query: {
    listings: async (_: any, { filters }: any) => {
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      let query = `
        SELECT 
          l.id, l.price, l.price_per_sqft, l.virtual_tour_url,
          l.showing_instructions, l.created_at, l.updated_at,
          p.id as property_id, p.property_type, p.bedrooms, p.bathrooms,
          p.sqft, p.lot_size_sqft, p.year_built, p.parking_spaces,
          p.features, p.description, p.hoa_fee, p.property_tax_annual,
          a.street, a.unit, a.city, a.state, a.zip_code, a.country,
          a.latitude, a.longitude,
          u.id as agent_id, u.first_name, u.last_name, u.email,
          ls.name as status_name, ls.description as status_description,
          lt.name as listing_type_name, lt.description as listing_type_description
        FROM listings l
        JOIN properties p ON l.property_id = p.id
        JOIN addresses a ON p.address_id = a.id
        JOIN users u ON l.agent_id = u.id
        JOIN listing_statuses ls ON l.status_id = ls.id
        JOIN listing_types lt ON l.listing_type_id = lt.id
        WHERE ls.is_active = true
      `;

      const queryParams: any[] = [];
      let paramIndex = 1;

      if (filters?.minPrice) {
        query += ` AND l.price >= $${paramIndex}`;
        queryParams.push(filters.minPrice);
        paramIndex++;
      }

      if (filters?.maxPrice) {
        query += ` AND l.price <= $${paramIndex}`;
        queryParams.push(filters.maxPrice);
        paramIndex++;
      }

      if (filters?.minBedrooms) {
        query += ` AND p.bedrooms >= $${paramIndex}`;
        queryParams.push(filters.minBedrooms);
        paramIndex++;
      }

      if (filters?.city) {
        query += ` AND LOWER(a.city) = LOWER($${paramIndex})`;
        queryParams.push(filters.city);
        paramIndex++;
      }

      if (filters?.propertyTypes && filters.propertyTypes.length > 0) {
        const types = filters.propertyTypes.map((type: string) => type.toLowerCase());
        query += ` AND p.property_type = ANY($${paramIndex})`;
        queryParams.push(types);
        paramIndex++;
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await pool.query(countQuery, queryParams);
      const totalCount = parseInt(countResult.rows[0].total);

      // Add pagination
      query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      const listings = result.rows.map((row: any) => ({
        id: row.id,
        price: row.price,
        pricePerSqft: row.price_per_sqft,
        virtualTourUrl: row.virtual_tour_url,
        showingInstructions: row.showing_instructions,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        property: {
          id: row.property_id,
          propertyType: row.property_type.toUpperCase(),
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          sqft: row.sqft,
          lotSizeSqft: row.lot_size_sqft,
          yearBuilt: row.year_built,
          parkingSpaces: row.parking_spaces,
          features: row.features || [],
          description: row.description,
          hoaFee: row.hoa_fee,
          propertyTaxAnnual: row.property_tax_annual,
          address: {
            street: row.street,
            unit: row.unit,
            city: row.city,
            state: row.state,
            zipCode: row.zip_code,
            country: row.country,
            latitude: row.latitude,
            longitude: row.longitude
          }
        },
        agent: {
          id: row.agent_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email
        },
        status: {
          name: row.status_name,
          description: row.status_description
        },
        listingType: {
          name: row.listing_type_name,
          description: row.listing_type_description
        }
      }));

      return {
        listings,
        totalCount,
        hasNextPage: offset + limit < totalCount
      };
    },

    listing: async (_: any, { id }: any) => {
      const query = `
        SELECT 
          l.id, l.price, l.price_per_sqft, l.virtual_tour_url,
          l.showing_instructions, l.private_remarks, l.created_at, l.updated_at,
          p.id as property_id, p.property_type, p.bedrooms, p.bathrooms,
          p.sqft, p.lot_size_sqft, p.year_built, p.parking_spaces,
          p.features, p.description, p.hoa_fee, p.property_tax_annual,
          p.zoning, p.mls_number,
          a.id as address_id, a.street, a.unit, a.city, a.state, a.zip_code, 
          a.country, a.latitude, a.longitude,
          u.id as agent_id, u.first_name, u.last_name, u.email, u.phone,
          ls.name as status_name, ls.description as status_description,
          lt.name as listing_type_name, lt.description as listing_type_description
        FROM listings l
        JOIN properties p ON l.property_id = p.id
        JOIN addresses a ON p.address_id = a.id
        JOIN users u ON l.agent_id = u.id
        JOIN listing_statuses ls ON l.status_id = ls.id
        JOIN listing_types lt ON l.listing_type_id = lt.id
        WHERE l.id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      return {
        id: row.id,
        price: row.price,
        pricePerSqft: row.price_per_sqft,
        virtualTourUrl: row.virtual_tour_url,
        showingInstructions: row.showing_instructions,
        privateRemarks: row.private_remarks,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        property: {
          id: row.property_id,
          propertyType: row.property_type.toUpperCase(),
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          sqft: row.sqft,
          lotSizeSqft: row.lot_size_sqft,
          yearBuilt: row.year_built,
          parkingSpaces: row.parking_spaces,
          features: row.features || [],
          description: row.description,
          hoaFee: row.hoa_fee,
          propertyTaxAnnual: row.property_tax_annual,
          zoning: row.zoning,
          mlsNumber: row.mls_number,
          address: {
            id: row.address_id,
            street: row.street,
            unit: row.unit,
            city: row.city,
            state: row.state,
            zipCode: row.zip_code,
            country: row.country,
            latitude: row.latitude,
            longitude: row.longitude
          }
        },
        agent: {
          id: row.agent_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone
        },
        status: {
          name: row.status_name,
          description: row.status_description
        },
        listingType: {
          name: row.listing_type_name,
          description: row.listing_type_description
        }
      };
    },

    featuredListings: async (_: any, { limit = 6 }: any) => {
      const query = `
        SELECT 
          l.id, l.price, l.price_per_sqft, l.created_at,
          p.id as property_id, p.property_type, p.bedrooms, p.bathrooms, p.sqft,
          a.street, a.city, a.state, a.zip_code,
          u.first_name, u.last_name
        FROM listings l
        JOIN properties p ON l.property_id = p.id
        JOIN addresses a ON p.address_id = a.id
        JOIN users u ON l.agent_id = u.id
        JOIN listing_statuses ls ON l.status_id = ls.id
        WHERE ls.is_active = true
        ORDER BY l.created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map((row: any) => ({
        id: row.id,
        price: row.price,
        pricePerSqft: row.price_per_sqft,
        createdAt: row.created_at,
        property: {
          id: row.property_id,
          propertyType: row.property_type.toUpperCase(),
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          sqft: row.sqft,
          address: {
            street: row.street,
            city: row.city,
            state: row.state,
            zipCode: row.zip_code
          }
        },
        agent: {
          firstName: row.first_name,
          lastName: row.last_name
        }
      }));
    },

    searchListings: async (_: any, { query: searchQuery, filters }: any) => {
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      let query = `
        SELECT 
          l.id, l.price, l.price_per_sqft, l.created_at,
          p.id as property_id, p.property_type, p.bedrooms, p.bathrooms,
          p.sqft, p.description, p.features,
          a.street, a.unit, a.city, a.state, a.zip_code,
          u.first_name, u.last_name
        FROM listings l
        JOIN properties p ON l.property_id = p.id
        JOIN addresses a ON p.address_id = a.id
        JOIN users u ON l.agent_id = u.id
        JOIN listing_statuses ls ON l.status_id = ls.id
        WHERE ls.is_active = true
        AND (
          LOWER(a.city) LIKE LOWER($1) OR
          LOWER(a.state) LIKE LOWER($1) OR
          LOWER(a.street) LIKE LOWER($1) OR
          LOWER(p.description) LIKE LOWER($1)
        )
      `;

      const queryParams = [`%${searchQuery}%`];
      let paramIndex = 2;

      // Apply additional filters (similar to listings query)
      if (filters?.minPrice) {
        query += ` AND l.price >= $${paramIndex}`;
        queryParams.push(filters.minPrice);
        paramIndex++;
      }

      query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);

      const result = await pool.query(query, queryParams);

      // For simplicity, return without total count for search
      return {
        listings: result.rows.map((row: any) => ({
          id: row.id,
          price: row.price,
          pricePerSqft: row.price_per_sqft,
          createdAt: row.created_at,
          property: {
            id: row.property_id,
            propertyType: row.property_type.toUpperCase(),
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            sqft: row.sqft,
            description: row.description,
            features: row.features || [],
            address: {
              street: row.street,
              unit: row.unit,
              city: row.city,
              state: row.state,
              zipCode: row.zip_code
            }
          },
          agent: {
            firstName: row.first_name,
            lastName: row.last_name
          }
        })),
        totalCount: result.rows.length,
        hasNextPage: result.rows.length === limit
      };
    }
  },

  Mutation: {
    recordListingView: async (_: any, { listingId }: any, context: Context) => {
      const query = `
        INSERT INTO listing_views (listing_id, user_id, viewed_at)
        VALUES ($1, $2, NOW())
      `;

      await pool.query(query, [listingId, context.user?.id || null]);
      return true;
    },

    createInquiry: async (_: any, { input }: any) => {
      const query = `
        INSERT INTO inquiries (
          listing_id, agent_id, inquirer_name, inquirer_email,
          inquirer_phone, message, inquiry_type
        )
        SELECT $1, l.agent_id, $2, $3, $4, $5, $6
        FROM listings l
        WHERE l.id = $1
        RETURNING id
      `;

      const result = await pool.query(query, [
        input.listingId,
        input.inquirerName,
        input.inquirerEmail,
        input.inquirerPhone || null,
        input.message || null,
        input.inquiryType.toLowerCase()
      ]);

      return { id: result.rows[0].id };
    }
  },

  // Field resolvers for nested data
  Listing: {
    images: async (parent: any) => {
      const query = `
        SELECT pi.*, CONCAT('https://your-s3-bucket.s3.amazonaws.com/', s3_key) as image_url
        FROM property_images pi
        WHERE pi.property_id = $1
        ORDER BY pi.sort_order, pi.created_at
      `;

      const result = await pool.query(query, [parent.property.id]);

      return result.rows.map((row: any) => ({
        id: row.id,
        s3Bucket: row.s3_bucket,
        s3Key: row.s3_key,
        originalFilename: row.original_filename,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        caption: row.caption,
        sortOrder: row.sort_order,
        isPrimary: row.is_primary,
        imageType: row.image_type.toUpperCase(),
        imageUrl: row.image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    },

    viewCount: async (parent: any) => {
      const query = `
        SELECT COUNT(*) as count
        FROM listing_views
        WHERE listing_id = $1
      `;

      const result = await pool.query(query, [parent.id]);
      return parseInt(result.rows[0].count);
    },

    openHouses: async (parent: any) => {
      const query = `
        SELECT *
        FROM open_houses
        WHERE listing_id = $1 AND is_cancelled = false
        ORDER BY open_house_date, start_time
      `;

      const result = await pool.query(query, [parent.id]);

      return result.rows.map((row: any) => ({
        id: row.id,
        openHouseDate: row.open_house_date,
        startTime: row.start_time,
        endTime: row.end_time,
        description: row.description,
        isCancelled: row.is_cancelled,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }
  },

  Property: {
    images: async (parent: any) => {
      // Same as Listing.images but direct property access
      const query = `
        SELECT *, CONCAT('https://your-s3-bucket.s3.amazonaws.com/', s3_key) as image_url
        FROM property_images
        WHERE property_id = $1
        ORDER BY sort_order, created_at
      `;

      const result = await pool.query(query, [parent.id]);

      return result.rows.map((row: any) => ({
        id: row.id,
        s3Bucket: row.s3_bucket,
        s3Key: row.s3_key,
        imageUrl: row.image_url,
        isPrimary: row.is_primary,
        imageType: row.image_type.toUpperCase(),
        sortOrder: row.sort_order
      }));
    }
  }
};