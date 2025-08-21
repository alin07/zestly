import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, BuildingOfficeIcon, HeartIcon, EyeIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { GET_AGENT_LISTINGS } from '../lib/queries';

const Dashboard: React.FC = () => {
  const { user, isAgent } = useAuth();

  // Fetch agent listings if user is an agent
  const { data: agentListingsData, loading: listingsLoading } = useQuery(GET_AGENT_LISTINGS, {
    skip: !isAgent,
    variables: { limit: 10 },
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Calculate stats from actual data for agents
  const agentListings = agentListingsData?.listings || [];
  const totalViews = agentListings.reduce((sum: number, listing: any) => sum + (listing.views || 0), 0);
  const activeListings = agentListings.filter((listing: any) => listing.status?.name === 'active').length;

  const stats = isAgent ? [
    { name: 'Active Listings', value: activeListings.toString(), icon: BuildingOfficeIcon, color: 'text-blue-600' },
    { name: 'Total Views', value: totalViews.toString(), icon: EyeIcon, color: 'text-green-600' },
    { name: 'All Listings', value: agentListings.length.toString(), icon: BuildingOfficeIcon, color: 'text-purple-600' },
    { name: 'Avg. Views', value: agentListings.length > 0 ? Math.round(totalViews / agentListings.length).toString() : '0', icon: HeartIcon, color: 'text-red-600' },
  ] : [
    { name: 'Saved Searches', value: '0', icon: BuildingOfficeIcon, color: 'text-blue-600' },
    { name: 'Favorite Properties', value: '0', icon: HeartIcon, color: 'text-red-600' },
    { name: 'Property Views', value: '0', icon: EyeIcon, color: 'text-green-600' },
    { name: 'Inquiries Sent', value: '0', icon: UserIcon, color: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isAgent 
            ? "Manage your listings and track your performance" 
            : "Find your dream home and track your searches"
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content based on role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isAgent ? (
          <>
            {/* Agent Dashboard */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
                <Link 
                  to="/listings/create"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Listing
                </Link>
              </div>
              
              {listingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : agentListings.length > 0 ? (
                <div className="space-y-4">
                  {agentListings.slice(0, 3).map((listing: any) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {listing.property.address?.street}, {listing.property.address?.city}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {listing.property.bedrooms} bed, {listing.property.bathrooms} bath • ${listing.price?.toLocaleString()}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              listing.status?.name === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {listing.status?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              {listing.views || 0} views
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/listings/edit/${listing.id}`}
                          className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                          title="Edit listing"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {agentListings.length > 3 && (
                    <Link
                      to="/listings"
                      className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                    >
                      View all {agentListings.length} listings →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No listings yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first listing to get started
                  </p>
                  <Link
                    to="/listings/create"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Listing
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/listings/create"
                  className="flex items-center w-full text-left p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-3" />
                  Create New Listing
                </Link>
                <Link
                  to="/listings"
                  className="flex items-center w-full text-left p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                  View All Listings
                </Link>
                <button className="flex items-center w-full text-left p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <UserIcon className="h-5 w-5 mr-3" />
                  Manage Inquiries
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Buyer Dashboard */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Searches</h2>
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No saved searches</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create a search to get notified of new properties
                </p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Create Search
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Favorite Properties</h2>
              <div className="text-center py-8">
                <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No favorite properties</p>
                <p className="text-sm text-gray-400 mt-2">
                  Save properties you like to view them later
                </p>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Browse Listings
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{user.firstName} {user.lastName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900">{user.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="text-gray-900 capitalize">{user.role.name}</p>
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;