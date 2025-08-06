import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_FEATURED_LISTINGS, GET_LISTINGS } from '../graphql/queries';
import ListingCard from './ListingCard';
import SearchBar from './SearchBar';
import Header from './Header';

const HomePage: React.FC = () => {
  const [searchFilters, setSearchFilters] = useState({});
  const [showAllListings, setShowAllListings] = useState(false);

  const { data: featuredData, loading: featuredLoading } = useQuery(GET_FEATURED_LISTINGS, {
    variables: { limit: 6 }
  });

  const { data: allListingsData, loading: allListingsLoading, fetchMore } = useQuery(GET_LISTINGS, {
    variables: { filters: { limit: 12, ...searchFilters } },
    skip: !showAllListings,
  });

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
    setShowAllListings(true);
  };

  const loadMoreListings = () => {
    if (allListingsData?.listings.hasNextPage) {
      fetchMore({
        variables: {
          filters: {
            ...searchFilters,
            offset: allListingsData.listings.listings.length,
            limit: 12
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Perfect Home with Zestly
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing properties, connect with top agents, and make your real estate dreams come true.
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Featured Listings Section */}
      {!showAllListings && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Properties
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium properties
              </p>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredData?.featuredListings.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <button
                onClick={() => setShowAllListings(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Properties
              </button>
            </div>
          </div>
        </section>
      )}

      {/* All Listings Section */}
      {showAllListings && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Property Listings
              </h2>
              <button
                onClick={() => {
                  setShowAllListings(false);
                  setSearchFilters({});
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Featured
              </button>
            </div>

            {allListingsLoading && !allListingsData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-2/3"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  {allListingsData?.listings.totalCount} properties found
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allListingsData?.listings.listings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {allListingsData?.listings.hasNextPage && (
                  <div className="text-center mt-12">
                    <button
                      onClick={loadMoreListings}
                      disabled={allListingsLoading}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {allListingsLoading ? 'Loading...' : 'Load More Properties'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Zestly</h3>
              <p className="text-gray-400">
                Your trusted partner in real estate. Find your perfect home today.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Buy</a></li>
                <li><a href="#" className="hover:text-white">Rent</a></li>
                <li><a href="#" className="hover:text-white">Sell</a></li>
                <li><a href="#" className="hover:text-white">Agents</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">📧 hello@zestly.com</p>
              <p className="text-gray-400 mb-2">📞 (555) 123-4567</p>
              <p className="text-gray-400">📍 123 Real Estate Ave, City, ST 12345</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Zestly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;