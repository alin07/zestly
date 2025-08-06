import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (filters: any) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [bedrooms, setBedrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filters: any = {};

    if (priceRange.min) filters.minPrice = parseInt(priceRange.min);
    if (priceRange.max) filters.maxPrice = parseInt(priceRange.max);
    if (bedrooms) filters.minBedrooms = parseInt(bedrooms);
    if (propertyType) filters.propertyTypes = [propertyType.toUpperCase()];

    onSearch({
      query: searchQuery,
      filters
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setBedrooms('');
    setPropertyType('');
    setShowAdvanced(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter city, neighborhood, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Search Properties
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Price Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Bedrooms:</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="apartment">Apartment</option>
              <option value="townhome">Townhome</option>
              <option value="land">Land</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </button>

          {(searchQuery || priceRange.min || priceRange.max || bedrooms || propertyType) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-700 text-sm underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Square Feet
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="1.5">1.5+</option>
                  <option value="2">2+</option>
                  <option value="2.5">2.5+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built (Min)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;