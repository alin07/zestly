import { gql } from '@apollo/client';

export const GET_LISTINGS = gql`
  query GetListings($filters: ListingFilters) {
    listings(filters: $filters) {
      listings {
        id
        price
        pricePerSqft
        createdAt
        property {
          id
          propertyType
          bedrooms
          bathrooms
          sqft
          description
          features
          address {
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
            imageUrl
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
          name
        }
        listingType {
          name
        }
      }
      totalCount
      hasNextPage
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
      createdAt
      updatedAt
      viewCount
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
          imageUrl
          isPrimary
          imageType
          caption
          sortOrder
        }
      }
      agent {
        id
        firstName
        lastName
        email
        phone
      }
      status {
        name
        description
      }
      listingType {
        name
        description
      }
      openHouses {
        id
        openHouseDate
        startTime
        endTime
        description
      }
    }
  }
`;

export const GET_FEATURED_LISTINGS = gql`
  query GetFeaturedListings($limit: Int = 6) {
    featuredListings(limit: $limit) {
      id
      price
      pricePerSqft
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
          imageUrl
          isPrimary
        }
      }
      agent {
        firstName
        lastName
      }
    }
  }
`;

export const SEARCH_LISTINGS = gql`
  query SearchListings($query: String!, $filters: ListingFilters) {
    searchListings(query: $query, filters: $filters) {
      listings {
        id
        price
        pricePerSqft
        createdAt
        property {
          id
          propertyType
          bedrooms
          bathrooms
          sqft
          description
          features
          address {
            street
            unit
            city
            state
            zipCode
          }
          images {
            id
            imageUrl
            isPrimary
          }
        }
        agent {
          firstName
          lastName
        }
      }
      totalCount
      hasNextPage
    }
  }
`;

export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($input: CreateInquiryInput!) {
    createInquiry(input: $input) {
      id
    }
  }
`;

export const RECORD_LISTING_VIEW = gql`
  mutation RecordListingView($listingId: ID!) {
    recordListingView(listingId: $listingId)
  }
`;