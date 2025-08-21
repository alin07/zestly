import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LISTINGS } from '../lib/queries';
import SimpleMap from './SimpleMap';
import { MagnifyingGlassIcon, MapIcon, ListBulletIcon } from '@heroicons/react/24/outline';

const ListingsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [focusedListing, setFocusedListing] = useState<any>(null);
  const [hoveredListing, setHoveredListing] = useState<any>(null);
  
  const { loading, error, data } = useQuery(GET_LISTINGS, {
    variables: { limit: 20 }
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-800">Error loading listings: {error.message}</p>
    </div>
  );

  const listings = data?.listings || [];

  const handleMarkerClick = (listing: any) => {
    setSelectedListing(listing);
  };

  const handleListingClick = (listing: any) => {
    setFocusedListing(listing);
    setSelectedListing(listing);
  };

  const handleBackToMap = () => {
    setFocusedListing(null);
    setSelectedListing(null);
  };

  const handleListingHover = (listing: any) => {
    setHoveredListing(listing);
  };

  const handleListingLeave = () => {
    setHoveredListing(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">
              {listings.length} properties found
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListBulletIcon className="h-4 w-4 mr-1" />
            List
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'split' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
            Split
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon className="h-4 w-4 mr-1" />
            Map
          </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 flex overflow-hidden ${viewMode === 'split' ? '' : 'flex-col'}`}>
        {/* Listings List */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'} overflow-y-auto p-4 space-y-4`}>
            {listings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No listings found.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try seeding the database with sample data.
                </p>
              </div>
            ) : (
              listings.map((listing: any) => (
                <div
                  key={listing.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border transition-all hover:shadow-lg cursor-pointer ${
                    selectedListing?.id === listing.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleListingClick(listing)}
                  onMouseEnter={() => handleListingHover(listing)}
                  onMouseLeave={handleListingLeave}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {formatPrice(listing.price)}
                        </h3>
                        <p className="text-gray-600">
                          {[
                            listing.property?.address?.street,
                            listing.property?.address?.unit
                          ].filter(Boolean).join(' ') || 'Address not available'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {[
                            listing.property?.address?.city,
                            listing.property?.address?.state,
                            listing.property?.address?.zipCode
                          ].filter(Boolean).join(', ') || 'Location not available'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        listing.status?.name === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status?.name || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-gray-600">
                      {listing.property?.bedrooms && (
                        <span>{listing.property.bedrooms} Bedrooms</span>
                      )}
                      {listing.property?.bathrooms && (
                        <span>{listing.property.bathrooms} Bathrooms</span>
                      )}
                      {listing.property?.sqft && (
                        <span>{listing.property.sqft.toLocaleString()} sqft</span>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center text-sm">
                      <span className="text-blue-600 font-medium">
                        {listing.listingType?.name?.toUpperCase() || 'N/A'}
                      </span>
                      <span className="text-gray-500">
                        Listed by {listing.agent?.firstName} {listing.agent?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Map */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 relative' : 'w-full'} flex flex-col`}>
            {/* Back Button for Focused View */}
            {focusedListing && viewMode === 'split' && (
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={handleBackToMap}
                  className="bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}
            {listings && listings.length > 0 ? (
              <SimpleMap
                className="h-full w-full"
                listings={focusedListing ? [focusedListing] : listings}
                onMarkerClick={handleMarkerClick}
                center={focusedListing?.property?.address?.latitude && focusedListing?.property?.address?.longitude 
                  ? [focusedListing.property.address.latitude, focusedListing.property.address.longitude] 
                  : undefined}
                zoom={focusedListing ? 16 : 12}
                hoveredListing={hoveredListing}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">No properties to display on map</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;