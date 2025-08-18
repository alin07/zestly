export * from './database';
export * from './context';

// Additional utility types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ListingFilters {
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  property_types?: string[];
  listing_types?: string[];
  city?: string;
  state?: string;
  zip_codes?: string[];
  features?: string[];
  status_ids?: number[];
}

export interface GraphQLContext {
  user?: any;
  req?: any;
}