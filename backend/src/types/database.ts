// Database entity types based on your schema
export interface Role {
  id: number;
  name: 'agent' | 'buyer' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface ListingStatus {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ListingType {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: number;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: number;
  profile_image_s3_bucket?: string;
  profile_image_s3_key?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  role?: Role; // Joined data
}

export interface Agency {
  id: number;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address_id?: number;
  logo_s3_bucket?: string;
  logo_s3_key?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  address?: Address; // Joined data
}

export interface AgentProfile {
  user_id: number;
  agency_id?: number;
  license_number?: string;
  years_experience?: number;
  specialties?: string[];
  bio?: string;
  commission_rate?: number;
  is_top_agent: boolean;
  created_at: Date;
  updated_at: Date;
  user?: User; // Joined data
  agency?: Agency; // Joined data
}

export interface Property {
  id: number;
  address_id: number;
  property_type: 'house' | 'condo' | 'apartment' | 'townhome' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lot_size_sqft?: number;
  year_built?: number;
  parking_spaces?: number;
  features?: string[];
  description?: string;
  hoa_fee?: number;
  property_tax_annual?: number;
  zoning?: string;
  mls_number?: string;
  created_at: Date;
  updated_at: Date;
  address?: Address; // Joined data
}

export interface Listing {
  id: number;
  property_id: number;
  agent_id: number;
  listing_type_id: number;
  status_id: number;
  price: number;
  price_per_sqft?: number;
  virtual_tour_url?: string;
  showing_instructions?: string;
  private_remarks?: string;
  created_at: Date;
  updated_at: Date;
  property?: Property; // Joined data
  agent?: User; // Joined data
  listing_type?: ListingType; // Joined data
  status?: ListingStatus; // Joined data
}

export interface PropertyImage {
  id: number;
  property_id: number;
  s3_bucket: string;
  s3_key: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  caption?: string;
  sort_order: number;
  is_primary: boolean;
  image_type: string;
  created_at: Date;
  updated_at: Date;
}

export interface OpenHouse {
  id: number;
  listing_id: number;
  open_house_date: Date;
  start_time: string;
  end_time: string;
  description?: string;
  is_cancelled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserFavorite {
  user_id: number;
  listing_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface SavedSearch {
  id: number;
  user_id: number;
  name: string;
  email_alerts: boolean;
  alert_frequency: 'immediate' | 'daily' | 'weekly';
  last_alert_sent?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SearchCriteria {
  id: number;
  saved_search_id: number;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_sqft?: number;
  max_sqft?: number;
  property_types?: string[];
  listing_type_ids?: number[];
  min_year_built?: number;
  max_days_on_market?: number;
  search_radius?: number;
  center_latitude?: number;
  center_longitude?: number;
  city?: string;
  state?: string;
  zip_codes?: string[];
  required_features?: string[];
  status_ids?: number[];
  created_at: Date;
  updated_at: Date;
}

export interface Inquiry {
  id: number;
  listing_id?: number;
  agent_id: number;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string;
  message?: string;
  inquiry_type: 'general' | 'showing' | 'info' | 'offer' | 'price_change';
  status: 'new' | 'responded' | 'closed';
  response_message?: string;
  responded_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ListingView {
  id: number;
  listing_id: number;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  viewed_at: Date;
  session_id?: string;
  created_at: Date;
  updated_at: Date;
}