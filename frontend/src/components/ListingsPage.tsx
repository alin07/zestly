import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_LISTINGS = gql`
  query GetListings($filters: ListingFilters) {
    listings(filters: $filters) {
      id
      title
      description
      status {
        id
        name
        isActive
      }
      listingType {
        id
        name
      }
      createdAt
    }
  }
`;

const GET_LISTING_METADATA = gql`
  query GetListingMetadata {
    listingStatuses {
      id
      name
      isActive
    }
    listingTypes {
      id
      name
    }
  }
`;

const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      status {
        name
      }
      listingType {
        name
      }
    }
  }
`;

function ListingsPage() {
  const [filters, setFilters] = useState({});

  const { loading, error, data, refetch } = useQuery(GET_LISTINGS, {
    variables: { filters },
  });

  const { data: metaData } = useQuery(GET_LISTING_METADATA);

  const [createListing] = useMutation(CREATE_LISTING, {
    onCompleted: () => {
      refetch(); // Refresh the listings
    },
  });

  const handleCreateListing = async () => {
    try {
      await createListing({
        variables: {
          input: {
            title: "New Listing",
            description: "A test listing",
            statusId: "1",
            listingTypeId: "1",
          },
        },
      });
    } catch (err) {
      console.error("Error creating listing:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={handleCreateListing}>Create Test Listing</button>

      <div>
        <h2>Listings ({data.listings.length})</h2>
        {data.listings.map((listing) => (
          <div
            key={listing.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
            }}
          >
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>Status: {listing.status.name}</p>
            <p>Type: {listing.listingType.name}</p>
            <small>
              Created: {new Date(listing.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListingsPage;
