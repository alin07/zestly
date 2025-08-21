import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_FEATURED_LISTINGS } from '../lib/queries';
import Map from './Map';
import { HomeIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_FEATURED_LISTINGS, {
    variables: { limit: 6 }
  });

  const featuredListings = data?.featuredListings || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream Home
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Discover the perfect property with our comprehensive real estate platform. 
              Browse thousands of listings with interactive maps and detailed information.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/listings"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Zestly?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines powerful search tools with interactive mapping to help you find the perfect property.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
              <p className="text-gray-600">
                Explore properties with our interactive Leaflet maps. See exact locations and neighborhood details.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Listings</h3>
              <p className="text-gray-600">
                Access detailed property information including photos, features, and pricing history.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about new listings, price changes, and market updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <Link 
              to="/listings" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Unable to load featured properties</p>
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured properties available</p>
              <p className="text-sm text-gray-400 mt-2">
                Add some listings to see them featured here
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing: any) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {listing.property?.images?.find((img: any) => img.isPrimary) ? (
                      <img
                        src={listing.property.images.find((img: any) => img.isPrimary).url}
                        alt="Property"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <HomeIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {formatPrice(listing.price)}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {listing.property?.address?.city}, {listing.property?.address?.state}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      {listing.property?.bedrooms && (
                        <span>{listing.property.bedrooms} bd</span>
                      )}
                      {listing.property?.bathrooms && (
                        <span>{listing.property.bathrooms} ba</span>
                      )}
                      {listing.property?.sqft && (
                        <span>{listing.property.sqft.toLocaleString()} sqft</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Properties on the Map
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get a better sense of location and neighborhood with our interactive map view.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Map
              className="h-96"
              listings={featuredListings}
              onMarkerClick={(listing) => {
                window.location.href = `/listing/${listing.id}`;
              }}
            />
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/listings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Properties on Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;