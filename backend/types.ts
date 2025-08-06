export const typeDefs = `#graphql
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
    createdAt: String!
    updatedAt: String!
  }

  type Role {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
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
    lastLoginAt: String
    createdAt: String!
    updatedAt: String!
    agentProfile: AgentProfile
    socialLinks: [SocialLink!]!
  }

  type SocialLink {
    id: ID!
    platform: String!
    url: String!
    createdAt: String!
    updatedAt: String!
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
    createdAt: String!
    updatedAt: String!
  }

  type AgentProfile {
    user: User!
    agency: Agency
    licenseNumber: String
    yearsExperience: Int
    specialties: [String!]!
    bio: String
    commissionRate: Float
    isTopAgent: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Property {
    id: ID!
    address: Address!
    propertyType: PropertyType!
    bedrooms: Int
    bathrooms: Float
    sqft: Int
    lotSizeSqft: Int
    yearBuilt: Int
    parkingSpaces: Int
    features: [String!]!
    description: String
    hoaFee: Int
    propertyTaxAnnual: Int
    zoning: String
    mlsNumber: String
    images: [PropertyImage!]!
    listings: [Listing!]!
    createdAt: String!
    updatedAt: String!
  }

  type PropertyImage {
    id: ID!
    s3Bucket: String!
    s3Key: String!
    originalFilename: String
    fileSize: Int
    mimeType: String
    caption: String
    sortOrder: Int!
    isPrimary: Boolean!
    imageType: ImageType!
    imageUrl: String!
    createdAt: String!
    updatedAt: String!
  }

  type ListingStatus {
    id: ID!
    name: String!
    description: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ListingType {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    updatedAt: String!
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
    viewCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type OpenHouse {
    id: ID!
    listing: Listing!
    openHouseDate: String!
    startTime: String!
    endTime: String!
    description: String
    isCancelled: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type SavedSearch {
    id: ID!
    user: User!
    name: String!
    emailAlerts: Boolean!
    alertFrequency: AlertFrequency!
    lastAlertSent: String
    criteria: SearchCriteria!
    createdAt: String!
    updatedAt: String!
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
    propertyTypes: [PropertyType!]!
    listingTypeIds: [ID!]!
    minYearBuilt: Int
    maxDaysOnMarket: Int
    searchRadius: Float
    centerLatitude: Float
    centerLongitude: Float
    city: String
    state: String
    zipCodes: [String!]!
    requiredFeatures: [String!]!
    statusIds: [ID!]!
    createdAt: String!
    updatedAt: String!
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
    respondedAt: String
    createdAt: String!
    updatedAt: String!
  }

  enum PropertyType {
    HOUSE
    CONDO
    APARTMENT
    TOWNHOME
    LAND
  }

  enum ImageType {
    INTERIOR
    EXTERIOR
    AERIAL
    FLOORPLAN
  }

  enum AlertFrequency {
    IMMEDIATE
    DAILY
    WEEKLY
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

  input ListingFilters {
    minPrice: Int
    maxPrice: Int
    minBedrooms: Int
    maxBedrooms: Int
    minBathrooms: Float
    maxBathrooms: Float
    minSqft: Int
    maxSqft: Int
    propertyTypes: [PropertyType!]
    city: String
    state: String
    zipCodes: [String!]
    statusIds: [ID!]
    agentId: ID
    limit: Int
    offset: Int
  }

  type ListingConnection {
    listings: [Listing!]!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type Query {
    # Listings
    listings(filters: ListingFilters): ListingConnection!
    listing(id: ID!): Listing
    featuredListings(limit: Int = 6): [Listing!]!
    
    # Properties
    property(id: ID!): Property
    
    # Users & Agents
    user(id: ID!): User
    agents(limit: Int = 10): [User!]!
    topAgents(limit: Int = 6): [User!]!
    
    # Search
    searchListings(query: String!, filters: ListingFilters): ListingConnection!
    
    # User-specific (requires auth)
    myFavorites: [Listing!]!
    mySavedSearches: [SavedSearch!]!
    myListings: [Listing!]!
    myInquiries: [Inquiry!]!
  }

  type Mutation {
    # User management
    registerUser(input: RegisterUserInput!): AuthPayload!
    loginUser(input: LoginUserInput!): AuthPayload!
    
    # Favorites
    addToFavorites(listingId: ID!): Boolean!
    removeFromFavorites(listingId: ID!): Boolean!
    
    # Saved searches
    createSavedSearch(input: CreateSavedSearchInput!): SavedSearch!
    updateSavedSearch(id: ID!, input: UpdateSavedSearchInput!): SavedSearch!
    deleteSavedSearch(id: ID!): Boolean!
    
    # Inquiries
    createInquiry(input: CreateInquiryInput!): Inquiry!
    respondToInquiry(id: ID!, response: String!): Inquiry!
    
    # Agent actions
    createListing(input: CreateListingInput!): Listing!
    updateListing(id: ID!, input: UpdateListingInput!): Listing!
    deleteListing(id: ID!): Boolean!
    
    # Analytics
    recordListingView(listingId: ID!): Boolean!
  }

  input RegisterUserInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
    roleId: ID!
  }

  input LoginUserInput {
    email: String!
    password: String!
  }

  input CreateSavedSearchInput {
    name: String!
    emailAlerts: Boolean = false
    alertFrequency: AlertFrequency = DAILY
    criteria: SearchCriteriaInput!
  }

  input UpdateSavedSearchInput {
    name: String
    emailAlerts: Boolean
    alertFrequency: AlertFrequency
    criteria: SearchCriteriaInput
  }

  input SearchCriteriaInput {
    minPrice: Int
    maxPrice: Int
    minBedrooms: Int
    maxBedrooms: Int
    minBathrooms: Float
    maxBathrooms: Float
    minSqft: Int
    maxSqft: Int
    propertyTypes: [PropertyType!]
    listingTypeIds: [ID!]
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
  }

  input CreateInquiryInput {
    listingId: ID
    inquirerName: String!
    inquirerEmail: String!
    inquirerPhone: String
    message: String
    inquiryType: InquiryType = GENERAL
  }

  input CreateListingInput {
    propertyId: ID!
    listingTypeId: ID!
    price: Int!
    virtualTourUrl: String
    showingInstructions: String
    privateRemarks: String
  }

  input UpdateListingInput {
    statusId: ID
    price: Int
    virtualTourUrl: String
    showingInstructions: String
    privateRemarks: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;