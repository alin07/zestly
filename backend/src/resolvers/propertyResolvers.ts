import { PropertyModel, AddressModel } from '../models';
import { GraphQLContext } from '../types';
import { GeocodingService } from '../services/geocodingService';

export const propertyResolvers = {
  Query: {
    property: async (_: any, { id }: { id: string }) => {
      const property = await PropertyModel.findById(parseInt(id));
      if (!property) {
        throw new Error('Property not found');
      }
      return property;
    },

    properties: async (_: any, { limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      return await PropertyModel.findAll(limit, offset);
    },
  },

  Mutation: {
    createAddress: async (_: any, { input }: { input: any }, { user }: GraphQLContext) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can create addresses');
      }

      let latitude = input.latitude;
      let longitude = input.longitude;

      // If coordinates not provided, try to geocode the address
      if (!latitude || !longitude) {
        console.log('Geocoding address:', { 
          street: input.street, 
          city: input.city, 
          state: input.state, 
          zipCode: input.zipCode 
        });
        
        const geocodeResult = await GeocodingService.geocodeAddress(
          input.street,
          input.unit,
          input.city,
          input.state,
          input.zipCode,
          input.country || 'USA'
        );

        if (geocodeResult) {
          latitude = geocodeResult.latitude;
          longitude = geocodeResult.longitude;
          console.log('Geocoding successful:', geocodeResult);
        } else {
          console.warn('Geocoding failed for address, creating without coordinates');
        }
      }

      return await AddressModel.create({
        street: input.street,
        unit: input.unit,
        city: input.city,
        state: input.state,
        zip_code: input.zipCode,
        country: input.country,
        latitude,
        longitude
      });
    },

    updateAddress: async (_: any, { id, input }: { id: string; input: any }, { user }: GraphQLContext) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can update addresses');
      }

      const updates: any = {};
      if (input.street !== undefined) updates.street = input.street;
      if (input.unit !== undefined) updates.unit = input.unit;
      if (input.city !== undefined) updates.city = input.city;
      if (input.state !== undefined) updates.state = input.state;
      if (input.zipCode !== undefined) updates.zip_code = input.zipCode;
      if (input.country !== undefined) updates.country = input.country;
      if (input.latitude !== undefined) updates.latitude = input.latitude;
      if (input.longitude !== undefined) updates.longitude = input.longitude;

      return await AddressModel.update(parseInt(id), updates);
    },

    createProperty: async (_: any, { input }: { input: any }, { user }: GraphQLContext) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can create properties');
      }

      if (!input.propertyType) {
        console.error('PropertyType is missing from input:', JSON.stringify(input, null, 2));
        throw new Error('Property type is required');
      }

      console.log('Creating property with type:', input.propertyType);

      return await PropertyModel.create({
        address_id: parseInt(input.addressId),
        property_type: input.propertyType.toLowerCase(),
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        sqft: input.sqft,
        lot_size_sqft: input.lotSizeSqft,
        year_built: input.yearBuilt,
        parking_spaces: input.parkingSpaces,
        features: input.features,
        description: input.description,
        hoa_fee: input.hoaFee,
        property_tax_annual: input.propertyTaxAnnual,
        zoning: input.zoning,
        mls_number: input.mlsNumber
      });
    },

    updateProperty: async (_: any, { id, input }: { id: string; input: any }, { user }: GraphQLContext) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can update properties');
      }

      const updates: any = {};
      if (input.addressId !== undefined) updates.address_id = parseInt(input.addressId);
      if (input.propertyType !== undefined) {
        if (!input.propertyType) {
          throw new Error('Property type cannot be empty');
        }
        updates.property_type = input.propertyType.toLowerCase();
      }
      if (input.bedrooms !== undefined) updates.bedrooms = input.bedrooms;
      if (input.bathrooms !== undefined) updates.bathrooms = input.bathrooms;
      if (input.sqft !== undefined) updates.sqft = input.sqft;
      if (input.lotSizeSqft !== undefined) updates.lot_size_sqft = input.lotSizeSqft;
      if (input.yearBuilt !== undefined) updates.year_built = input.yearBuilt;
      if (input.parkingSpaces !== undefined) updates.parking_spaces = input.parkingSpaces;
      if (input.features !== undefined) updates.features = input.features;
      if (input.description !== undefined) updates.description = input.description;
      if (input.hoaFee !== undefined) updates.hoa_fee = input.hoaFee;
      if (input.propertyTaxAnnual !== undefined) updates.property_tax_annual = input.propertyTaxAnnual;
      if (input.zoning !== undefined) updates.zoning = input.zoning;
      if (input.mlsNumber !== undefined) updates.mls_number = input.mlsNumber;

      return await PropertyModel.update(parseInt(id), updates);
    },

    uploadPropertyImage: async (
      _: any,
      { propertyId, file, caption, isPrimary }: { propertyId: string; file: any; caption?: string; isPrimary?: boolean },
      { user }: GraphQLContext
    ) => {
      if (!user || user.role?.name !== 'agent') {
        throw new Error('Only agents can upload property images');
      }

      // TODO: Implement actual file upload to S3
      // For now, just return a mock image
      const imageData: any = {
        s3_bucket: 'zestly-images',
        s3_key: `properties/${propertyId}/${Date.now()}.jpg`,
        is_primary: isPrimary || false,
        image_type: 'interior'
      };
      
      if (file?.filename) imageData.original_filename = file.filename;
      if (file?.size) imageData.file_size = file.size;
      if (file?.mimetype) imageData.mime_type = file.mimetype;
      if (caption) imageData.caption = caption;

      return await PropertyModel.addImage(parseInt(propertyId), imageData);
    },
  },

  Property: {
    // Convert database fields to GraphQL schema fields
    propertyType: (parent: any) => parent.property_type?.toUpperCase() || 'HOUSE',
    sqft: (parent: any) => parent.sqft,
    lotSizeSqft: (parent: any) => parent.lot_size_sqft,
    yearBuilt: (parent: any) => parent.year_built,
    parkingSpaces: (parent: any) => parent.parking_spaces,
    hoaFee: (parent: any) => parent.hoa_fee,
    propertyTaxAnnual: (parent: any) => parent.property_tax_annual,
    mlsNumber: (parent: any) => parent.mls_number,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,

    // Nested resolvers - data comes from JOIN in the query
    address: (parent: any) => {
      if (parent.street) {
        return {
          id: parent.address_id,
          street: parent.street,
          unit: parent.unit,
          city: parent.city,
          state: parent.state,
          zipCode: parent.zip_code,
          country: parent.country,
          latitude: parent.latitude,
          longitude: parent.longitude
        };
      }
      return null;
    },

    images: async (parent: any) => {
      if (parent.images && Array.isArray(parent.images)) {
        return parent.images;
      }
      return await PropertyModel.getImages(parent.id);
    },
  },

  PropertyImage: {
    url: (parent: any) => parent.url || `https://s3.amazonaws.com/${parent.s3_bucket}/${parent.s3_key}`,
    originalFilename: (parent: any) => parent.original_filename,
    fileSize: (parent: any) => parent.file_size,
    mimeType: (parent: any) => parent.mime_type,
    sortOrder: (parent: any) => parent.sort_order,
    isPrimary: (parent: any) => parent.is_primary,
    imageType: (parent: any) => parent.image_type,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at
  },

  Address: {
    zipCode: (parent: any) => parent.zip_code,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at
  }
};
