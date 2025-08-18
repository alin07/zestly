import { authResolvers } from './authResolvers';
import listingResolvers from './listingResolvers';
import { userResolvers } from './userResolvers';
import { propertyResolvers } from './propertyResolvers';
import { ReferenceDataModel, AnalyticsModel } from '../models';
import { DateTimeResolver } from 'graphql-scalars';

const rootResolvers = {
  Query: {
    // Reference data queries
    listingStatuses: () => ReferenceDataModel.getListingStatuses(),
    listingTypes: () => ReferenceDataModel.getListingTypes(),
    roles: () => ReferenceDataModel.getRoles(),

    // Analytics queries
    listingViews: async (_: any, { listingId, days = 30 }: { listingId: string; days?: number }) => {
      return await AnalyticsModel.getListingViews(parseInt(listingId), days);
    },
  },

  // Type resolvers for database field mapping
  ListingType: {
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,
  },

  ListingStatus: {
    isActive: (parent: any) => parent.is_active,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,
  },

  Role: {
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,
  },
  
  // Scalar resolvers
  DateTime: DateTimeResolver,
};

export const resolvers = [
  rootResolvers,
  authResolvers,
  listingResolvers,
  userResolvers,
  propertyResolvers
];