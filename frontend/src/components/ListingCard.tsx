import React from 'react';

interface ListingCardProps {
  listing: {
    id: string;
    price: number;
    pricePerSqft?: number;
    createdAt: string;
    property: {
      id: string;
      propertyType: string;
      bedrooms?: number;
      bathrooms?: number;
      sqft?: number;
      address: {
        street: string;
        unit?: string;
        city: string;
        state: string;
        zipCode: string;
      };
      images: Array<{
        id: string;
        imageUrl: string;
        isPrimary: boolean;
      }>;
    };
    agent: {
      firstName: string;
      lastName: string;
    };
  };
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const primaryImage = listing.property.images.find(img => img.isPrimary) || listing.property.images[0];
  const fallbackImage = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const handleCardClick = () => {
    // Navigate to listing detail page - implement routing as needed
    console.log('Navigate to listing:', listing.id);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={primaryImage?.imageUrl || fallbackImage}
          alt={`${listing.property.address.street} ${listing.property.address.city}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
          {formatPropertyType(listing.property.propertyType)}
        </div>
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {listing.property.images.length} photos
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(listing.price)}
          </span>
          {listing.pricePerSqft && (
            <span className="text-gray-500 ml-2">
              ${listing.pricePerSqft}/sqft
            </span>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center text-gray-600 mb-3 space-x-4">
          {listing.property.bedrooms && (
            <span className="flex items-center">
              🛏️ {listing.property.bedrooms} bed{listing.property.bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {listing.property.bathrooms && (
            <span className="flex items-center">
              🚿 {listing.property.bathrooms} bath{listing.property.bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          {listing.property.sqft && (
            <span className="flex items-center">
              📐 {listing.property.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Address */}
        <div className="mb-3">
          <p className="text-gray-900 font-medium">
            {listing.property.address.street}
            {listing.property.address.unit && ` #${listing.property.address.unit}`}
          </p>
          <p className="text-gray-600">
            {listing.property.address.city}, {listing.property.address.state} {listing.property.address.zipCode}
          </p>
        </div>

        {/* Agent */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Listed by {listing.agent.firstName} {listing.agent.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;