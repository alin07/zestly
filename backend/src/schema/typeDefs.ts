import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar DateTime
  scalar Upload

  type Role {
    id: ID!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    id: ID!
    street: String!
    unit: String
    city: String!
    state: String!
    zipCode: String!
    country: String!
    latitude: Float
    longitude: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    role: Role!
    profileImageUrl: String
    isVerified: Boolean!
    isActive: Boolean!
    lastLoginAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    agentProfile: AgentProfile
  }

  type Agency {
    id: ID!
    name: String!
    description: String
    website: String
    phone: String
    email: String
    address: Address
    logoUrl: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AgentProfile {
    userId: ID!
    user: User!
    agency: Agency
    licenseNumber: String
    yearsExperience: Int
    specialties: [String!]
    bio: String
    commissionRate: Float
    isTopAgent: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Property {
    id: ID!
    address: Address
    propertyType: PropertyType!
    bedrooms: Int
    bathrooms: Float
    sqft: Int
    lotSizeSqft: Int
    yearBuilt: Int
    parkingSpaces: Int
    features: [String!]
    description: String
    hoaFee: Int
    propertyTaxAnnual: Int
    zoning: String
    mlsNumber: String
    images: [PropertyImage!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PropertyImage {
    id: ID!
    propertyId: ID!
    url: String!
    originalFilename: String
    fileSize: Int
    mimeType: String
    caption: String
    sortOrder: Int!
    isPrimary: Boolean!
    imageType: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Listing {
    id: ID!
    property: Property!
    agent: User!
    listingType: ListingType!
    status: ListingStatus!
    price: Int!
    pricePerSqft: Float
    virtualTourUrl: String
    showingInstructions: String
    privateRemarks: String
    openHouses: [OpenHouse!]!
    views: Int!
    isFavorited: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OpenHouse {
    id: ID!
    listingId: ID!
    date: DateTime!
    startTime: String!
    endTime: String!
    description: String
    isCancelled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ListingStatus {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ListingType {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SavedSearch {
    id: ID!
    userId: ID!
    name: String!
    emailAlerts: Boolean!
    alertFrequency: String!
    lastAlertSent: DateTime
    criteria: SearchCriteria!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SearchCriteria {
    id: ID!
    minPrice: Int
    maxPrice: Int
    minBedrooms: Int
    maxBedrooms: Int
    minBathrooms: Float
    maxBathrooms: Float
    minSqft: Int
    maxSqft: Int
    propertyTypes: [PropertyType!]
    listingTypes: [String!]
    minYearBuilt: Int
    maxDaysOnMarket: Int
    searchRadius: Float
    centerLatitude: Float
    centerLongitude: Float
    city: String
    state: String
    zipCodes: [String!]
    requiredFeatures: [String!]
    statusIds: [ID!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Inquiry {
    id: ID!
    listing: Listing
    agent: User!
    inquirerName: String!
    inquirerEmail: String!
    inquirerPhone: String
    message: String
    inquiryType: InquiryType!
    status: InquiryStatus!
    responseMessage: String
    respondedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum PropertyType {
    HOUSE
    CONDO
    APARTMENT
    TOWNHOME
    LAND
  }

  enum InquiryType {
    GENERAL
    SHOWING
    INFO
    OFFER
    PRICE_CHANGE
  }

  enum InquiryStatus {
    NEW
    RESPONDED
    CLOSED
  }

  input AddressInput {
    street: String!
    unit: String
    city: String!
    state: String!
    zipCode: String!
    country: String = "United States"
    latitude: Float
    longitude: Float
  }

  input PropertyInput {
    addressId: ID!
    propertyType: PropertyType!
    bedrooms: Int
    bathrooms: Float
    sqft: Int
    lotSizeSqft: Int
    yearBuilt: Int
    parkingSpaces: Int
    features: [String!]
    description: String
    hoaFee: Int
    propertyTaxAnnual: Int
    zoning: String
    mlsNumber: String
  }

  input ListingInput {
    propertyId: ID!
    agentId: ID!
    listingTypeId: ID!
    price: Int!
    pricePerSqft: Float
    virtualTourUrl: String
    showingInstructions: String
    privateRemarks: String
  }

  input SearchFilters {
    minPrice: Int
    maxPrice: Int
    minBedrooms: Int
    maxBedrooms: Int
    minBathrooms: Float
    maxBathrooms: Float
    minSqft: Int
    maxSqft: Int
    propertyTypes: [PropertyType!]
    listingTypes: [String!]
    city: String
    state: String
    zipCodes: [String!]
    features: [String!]
    sortBy: String
    sortOrder: String
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
    role: String! = "buyer"
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
  }

  type Query {
    # Auth queries
    me: User

    # Listing queries
    listings(filters: SearchFilters, limit: Int = 20, offset: Int = 0): [Listing!]!
    listing(id: ID!): Listing
    featuredListings(limit: Int = 10): [Listing!]!

    # Property queries
    property(id: ID!): Property
    properties(limit: Int = 20, offset: Int = 0): [Property!]!

    # User queries
    users(role: String, limit: Int = 20, offset: Int = 0): [User!]!
    user(id: ID!): User
    agents(limit: Int = 20, offset: Int = 0): [AgentProfile!]!
    agent(id: ID!): AgentProfile

    # Search queries
    searchListings(filters: SearchFilters!, limit: Int = 20, offset: Int = 0): [Listing!]!
    savedSearches(userId: ID!): [SavedSearch!]!

    # Analytics queries
    listingViews(listingId: ID!, days: Int = 30): Int!

    # Reference data
    listingStatuses: [ListingStatus!]!
    listingTypes: [ListingType!]!
    roles: [Role!]!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!

    # Listing mutations
    createListing(input: ListingInput!): Listing!
    updateListing(id: ID!, input: ListingInput!): Listing!
    deleteListing(id: ID!): Boolean!
    updateListingStatus(id: ID!, statusId: ID!): Listing!

    # Property mutations
    createProperty(input: PropertyInput!): Property!
    updateProperty(id: ID!, input: PropertyInput!): Property!

    # Address mutations
    createAddress(input: AddressInput!): Address!
    updateAddress(id: ID!, input: AddressInput!): Address!

    # Favorite mutations
    addToFavorites(listingId: ID!): Boolean!
    removeFromFavorites(listingId: ID!): Boolean!

    # Image upload
    uploadPropertyImage(propertyId: ID!, file: Upload!, caption: String, isPrimary: Boolean): PropertyImage!

    # Inquiry mutations
    createInquiry(listingId: ID, agentId: ID!, inquirerName: String!, inquirerEmail: String!, inquirerPhone: String, message: String, inquiryType: InquiryType!): Inquiry!
    respondToInquiry(id: ID!, responseMessage: String!): Inquiry!

    # Analytics mutations
    recordListingView(listingId: ID!, sessionId: String): Boolean!

    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
  }
`;