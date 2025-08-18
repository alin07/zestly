export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  profileImageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  agentProfile?: AgentProfile;
}

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  address: Address;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSizeSqft?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  features?: string[];
  description?: string;
  hoaFee?: number;
  propertyTaxAnnual?: number;
  zoning?: string;
  mlsNumber?: string;
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  imageType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  property: Property;
  agent: User;
  listingType: ListingType;
  status: ListingStatus;
  price: number;
  pricePerSqft?: number;
  virtualTourUrl?: string;
  showingInstructions?: string;
  privateRemarks?: string;
  openHouses: OpenHouse[];
  views: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpenHouse {
  id: string;
  listingId: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingStatus {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfile {
  userId: string;
  user: User;
  agency?: Agency;
  licenseNumber?: string;
  yearsExperience?: number;
  specialties?: string[];
  bio?: string;
  commissionRate?: number;
  isTopAgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: Address;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  propertyTypes?: PropertyType[];
  listingTypes?: string[];
  city?: string;
  state?: string;
  zipCodes?: string[];
  features?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  CONDO = 'CONDO',
  APARTMENT = 'APARTMENT',
  TOWNHOME = 'TOWNHOME',
  LAND = 'LAND'
}

export enum InquiryType {
  GENERAL = 'GENERAL',
  SHOWING = 'SHOWING',
  INFO = 'INFO',
  OFFER = 'OFFER',
  PRICE_CHANGE = 'PRICE_CHANGE'
}

export enum InquiryStatus {
  NEW = 'NEW',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED'
}