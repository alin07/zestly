import { gql } from '@apollo/client';

export const GET_LISTINGS = gql`
  query GetListings($filters: SearchFilters, $limit: Int, $offset: Int) {
    listings(filters: $filters, limit: $limit, offset: $offset) {
      id
      price
      pricePerSqft
      virtualTourUrl
      views
      isFavorited
      createdAt
      updatedAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        description
        address {
          id
          street
          unit
          city
          state
          zipCode
          latitude
          longitude
        }
        images {
          id
          url
          caption
          isPrimary
          imageType
        }
      }
      agent {
        id
        firstName
        lastName
        email
      }
      status {
        id
        name
        description
        isActive
      }
      listingType {
        id
        name
        description
      }
    }
  }
`;

export const GET_LISTING = gql`
  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      price
      pricePerSqft
      virtualTourUrl
      showingInstructions
      views
      isFavorited
      createdAt
      updatedAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        lotSizeSqft
        yearBuilt
        parkingSpaces
        features
        description
        hoaFee
        propertyTaxAnnual
        zoning
        mlsNumber
        address {
          id
          street
          unit
          city
          state
          zipCode
          country
          latitude
          longitude
        }
        images {
          id
          url
          caption
          sortOrder
          isPrimary
          imageType
        }
      }
      agent {
        id
        firstName
        lastName
        email
        phone
        agentProfile {
          licenseNumber
          yearsExperience
          specialties
          bio
          isTopAgent
        }
      }
      status {
        id
        name
        description
        isActive
      }
      listingType {
        id
        name
        description
      }
      openHouses {
        id
        date
        startTime
        endTime
        description
        isCancelled
      }
    }
  }
`;

export const GET_FEATURED_LISTINGS = gql`
  query GetFeaturedListings($limit: Int) {
    featuredListings(limit: $limit) {
      id
      price
      pricePerSqft
      views
      isFavorited
      createdAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        address {
          city
          state
        }
        images {
          id
          url
          isPrimary
        }
      }
      agent {
        id
        firstName
        lastName
      }
      status {
        name
      }
    }
  }
`;

export const SEARCH_LISTINGS = gql`
  query SearchListings($filters: SearchFilters!, $limit: Int, $offset: Int) {
    searchListings(filters: $filters, limit: $limit, offset: $offset) {
      id
      price
      pricePerSqft
      views
      isFavorited
      createdAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        address {
          street
          city
          state
          zipCode
        }
        images {
          id
          url
          isPrimary
        }
      }
      agent {
        id
        firstName
        lastName
      }
      status {
        name
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        phone
        isVerified
        isActive
        role {
          id
          name
        }
        agentProfile {
          licenseNumber
          yearsExperience
          specialties
          bio
          isTopAgent
        }
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        firstName
        lastName
        phone
        isVerified
        isActive
        role {
          id
          name
        }
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      phone
      profileImageUrl
      isVerified
      isActive
      lastLoginAt
      createdAt
      role {
        id
        name
      }
      agentProfile {
        licenseNumber
        yearsExperience
        specialties
        bio
        commissionRate
        isTopAgent
      }
    }
  }
`;

export const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($listingId: ID!) {
    addToFavorites(listingId: $listingId)
  }
`;

export const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($listingId: ID!) {
    removeFromFavorites(listingId: $listingId)
  }
`;

export const RECORD_LISTING_VIEW = gql`
  mutation RecordListingView($listingId: ID!, $sessionId: String) {
    recordListingView(listingId: $listingId, sessionId: $sessionId)
  }
`;

export const GET_LISTING_STATUSES = gql`
  query GetListingStatuses {
    listingStatuses {
      id
      name
      description
      isActive
    }
  }
`;

export const GET_LISTING_TYPES = gql`
  query GetListingTypes {
    listingTypes {
      id
      name
      description
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      id
      street
      unit
      city
      state
      zipCode
      country
      latitude
      longitude
    }
  }
`;

export const CREATE_PROPERTY = gql`
  mutation CreateProperty($input: PropertyInput!) {
    createProperty(input: $input) {
      id
      propertyType
      bedrooms
      bathrooms
      sqft
      lotSizeSqft
      yearBuilt
      parkingSpaces
      features
      description
      hoaFee
      propertyTaxAnnual
      zoning
      mlsNumber
      address {
        id
        street
        unit
        city
        state
        zipCode
        country
        latitude
        longitude
      }
    }
  }
`;

export const CREATE_COMPLETE_LISTING = gql`
  mutation CreateCompleteListing($input: CreateListingInput!) {
    createCompleteListing(input: $input) {
      id
      price
      pricePerSqft
      virtualTourUrl
      showingInstructions
      privateRemarks
      views
      createdAt
      updatedAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        lotSizeSqft
        yearBuilt
        parkingSpaces
        features
        description
        hoaFee
        propertyTaxAnnual
        zoning
        mlsNumber
        address {
          id
          street
          unit
          city
          state
          zipCode
          country
          latitude
          longitude
        }
      }
      agent {
        id
        firstName
        lastName
        email
      }
      status {
        id
        name
        description
      }
      listingType {
        id
        name
        description
      }
    }
  }
`;

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: ID!, $input: ListingInput!) {
    updateListing(id: $id, input: $input) {
      id
      price
      pricePerSqft
      virtualTourUrl
      showingInstructions
      privateRemarks
      views
      createdAt
      updatedAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        lotSizeSqft
        yearBuilt
        parkingSpaces
        features
        description
        hoaFee
        propertyTaxAnnual
        zoning
        mlsNumber
        address {
          id
          street
          unit
          city
          state
          zipCode
          country
          latitude
          longitude
        }
      }
      agent {
        id
        firstName
        lastName
        email
      }
      status {
        id
        name
        description
      }
      listingType {
        id
        name
        description
      }
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: ID!, $input: PropertyInput!) {
    updateProperty(id: $id, input: $input) {
      id
      propertyType
      bedrooms
      bathrooms
      sqft
      lotSizeSqft
      yearBuilt
      parkingSpaces
      features
      description
      hoaFee
      propertyTaxAnnual
      zoning
      mlsNumber
      address {
        id
        street
        unit
        city
        state
        zipCode
        country
        latitude
        longitude
      }
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: AddressInput!) {
    updateAddress(id: $id, input: $input) {
      id
      street
      unit
      city
      state
      zipCode
      country
      latitude
      longitude
    }
  }
`;

export const GET_AGENT_LISTINGS = gql`
  query GetAgentListings($limit: Int, $offset: Int) {
    listings(limit: $limit, offset: $offset) {
      id
      price
      pricePerSqft
      virtualTourUrl
      showingInstructions
      privateRemarks
      views
      createdAt
      updatedAt
      property {
        id
        propertyType
        bedrooms
        bathrooms
        sqft
        description
        address {
          id
          street
          unit
          city
          state
          zipCode
        }
        images {
          id
          url
          caption
          isPrimary
          imageType
        }
      }
      status {
        id
        name
        description
        isActive
      }
      listingType {
        id
        name
        description
      }
    }
  }
`;