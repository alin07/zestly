import React from 'react';
import { useParams } from 'react-router-dom';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Listing Detail #{id}
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Detailed view for listing {id} - Coming soon!
        </p>
      </div>
    </div>
  );
};

export default ListingDetailPage;