import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_COMPLETE_LISTING, GET_LISTING_TYPES, GET_LISTING_STATUSES } from '../lib/queries';
import { useAuth } from '../contexts/AuthContext';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAgent } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Address form data
  const [addressData, setAddressData] = useState({
    street: '',
    unit: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Property form data
  const [propertyData, setPropertyData] = useState({
    propertyType: 'HOUSE' as const,
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    lotSizeSqft: '',
    yearBuilt: '',
    parkingSpaces: '',
    features: [] as string[],
    description: '',
    hoaFee: '',
    propertyTaxAnnual: '',
    zoning: '',
    mlsNumber: '',
  });

  // Listing form data
  const [listingData, setListingData] = useState({
    listingTypeId: '',
    price: '',
    pricePerSqft: '',
    virtualTourUrl: '',
    showingInstructions: '',
    privateRemarks: '',
  });

  const [newFeature, setNewFeature] = useState('');

  const { data: listingTypesData } = useQuery(GET_LISTING_TYPES);
  const { data: listingStatusesData } = useQuery(GET_LISTING_STATUSES);

  const [createCompleteListing] = useMutation(CREATE_COMPLETE_LISTING);

  // Redirect non-agents
  if (!isAgent) {
    navigate('/dashboard');
    return null;
  }

  const validateStep = (step: number) => {
    setError('');
    
    if (step === 1) {
      if (!addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
        setError('Please fill in all required address fields');
        return false;
      }
    } else if (step === 2) {
      if (!propertyData.propertyType || !propertyData.bedrooms || !propertyData.bathrooms) {
        setError('Please fill in all required property fields');
        return false;
      }
    } else if (step === 3) {
      console.log(listingData);
      if (!listingData.listingTypeId || !listingData.price) {
        setError('Please fill in all required listing fields');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleListingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setListingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPropertyData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setPropertyData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      console.log('Creating complete listing with data:', { addressData, propertyData, listingData });
      
      // Create complete listing in one transaction
      await createCompleteListing({
        variables: {
          input: {
            address: {
              street: addressData.street,
              unit: addressData.unit || null,
              city: addressData.city,
              state: addressData.state,
              zipCode: addressData.zipCode,
              country: addressData.country,
              latitude: addressData.latitude,
              longitude: addressData.longitude,
            },
            property: {
              propertyType: propertyData.propertyType,
              bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms) : null,
              bathrooms: propertyData.bathrooms ? parseFloat(propertyData.bathrooms) : null,
              sqft: propertyData.sqft ? parseInt(propertyData.sqft) : null,
              lotSizeSqft: propertyData.lotSizeSqft ? parseInt(propertyData.lotSizeSqft) : null,
              yearBuilt: propertyData.yearBuilt ? parseInt(propertyData.yearBuilt) : null,
              parkingSpaces: propertyData.parkingSpaces ? parseInt(propertyData.parkingSpaces) : null,
              features: propertyData.features,
              description: propertyData.description || null,
              hoaFee: propertyData.hoaFee ? parseInt(propertyData.hoaFee) : null,
              propertyTaxAnnual: propertyData.propertyTaxAnnual ? parseInt(propertyData.propertyTaxAnnual) : null,
              zoning: propertyData.zoning || null,
              mlsNumber: propertyData.mlsNumber || null,
            },
            listingTypeId: listingData.listingTypeId,
            price: parseInt(listingData.price),
            pricePerSqft: listingData.pricePerSqft ? parseFloat(listingData.pricePerSqft) : null,
            virtualTourUrl: listingData.virtualTourUrl || null,
            showingInstructions: listingData.showingInstructions || null,
            privateRemarks: listingData.privateRemarks || null,
          }
        }
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Property Address</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="street" className="label">
                  Street Address *
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  className="input"
                  placeholder="123 Main Street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                />
              </div>

              <div>
                <label htmlFor="unit" className="label">
                  Unit/Apt (Optional)
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  className="input"
                  placeholder="Apt 2B"
                  value={addressData.unit}
                  onChange={handleAddressChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="label">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="input"
                    placeholder="San Francisco"
                    value={addressData.city}
                    onChange={handleAddressChange}
                  />
                </div>

                <div>
                  <label htmlFor="state" className="label">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    className="input"
                    value={addressData.state}
                    onChange={handleAddressChange}
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    {/* Add more states as needed */}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="zipCode" className="label">
                  ZIP Code *
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  required
                  className="input"
                  placeholder="94105"
                  value={addressData.zipCode}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="propertyType" className="label">
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  required
                  className="input"
                  value={propertyData.propertyType}
                  onChange={handlePropertyChange}
                >
                  <option value="HOUSE">House</option>
                  <option value="CONDO">Condo</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="TOWNHOME">Townhome</option>
                  <option value="LAND">Land</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bedrooms" className="label">
                    Bedrooms *
                  </label>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    required
                    className="input"
                    placeholder="3"
                    value={propertyData.bedrooms}
                    onChange={handlePropertyChange}
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="label">
                    Bathrooms *
                  </label>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    className="input"
                    placeholder="2.5"
                    value={propertyData.bathrooms}
                    onChange={handlePropertyChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sqft" className="label">
                    Square Feet
                  </label>
                  <input
                    id="sqft"
                    name="sqft"
                    type="number"
                    min="0"
                    className="input"
                    placeholder="2000"
                    value={propertyData.sqft}
                    onChange={handlePropertyChange}
                  />
                </div>

                <div>
                  <label htmlFor="yearBuilt" className="label">
                    Year Built
                  </label>
                  <input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="input"
                    placeholder="1995"
                    value={propertyData.yearBuilt}
                    onChange={handlePropertyChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Property Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="input"
                  placeholder="Describe the property..."
                  value={propertyData.description}
                  onChange={handlePropertyChange}
                />
              </div>

              <div>
                <label className="label">Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Add a feature (e.g., Hardwood floors)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {propertyData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Listing Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="listingTypeId" className="label">
                  Listing Type *
                </label>
                <select
                  id="listingTypeId"
                  name="listingTypeId"
                  required
                  className="input"
                  value={listingData.listingTypeId}
                  onChange={handleListingChange}
                >
                  <option value="">Select Listing Type</option>
                  {listingTypesData?.listingTypes?.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="label">
                    Price *
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    required
                    className="input"
                    placeholder="500000"
                    value={listingData.price}
                    onChange={handleListingChange}
                  />
                </div>

                <div>
                  <label htmlFor="pricePerSqft" className="label">
                    Price per Sq Ft
                  </label>
                  <input
                    id="pricePerSqft"
                    name="pricePerSqft"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="250.00"
                    value={listingData.pricePerSqft}
                    onChange={handleListingChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="virtualTourUrl" className="label">
                  Virtual Tour URL
                </label>
                <input
                  id="virtualTourUrl"
                  name="virtualTourUrl"
                  type="url"
                  className="input"
                  placeholder="https://example.com/virtual-tour"
                  value={listingData.virtualTourUrl}
                  onChange={handleListingChange}
                />
              </div>

              <div>
                <label htmlFor="showingInstructions" className="label">
                  Showing Instructions
                </label>
                <textarea
                  id="showingInstructions"
                  name="showingInstructions"
                  rows={3}
                  className="input"
                  placeholder="Please call 24 hours in advance..."
                  value={listingData.showingInstructions}
                  onChange={handleListingChange}
                />
              </div>

              <div>
                <label htmlFor="privateRemarks" className="label">
                  Private Remarks (Agent Only)
                </label>
                <textarea
                  id="privateRemarks"
                  name="privateRemarks"
                  rows={3}
                  className="input"
                  placeholder="Notes for other agents..."
                  value={listingData.privateRemarks}
                  onChange={handleListingChange}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
            
            {/* Progress Steps */}
            <div className="mt-4">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">Address</span>
                <span className="text-sm text-gray-600">Property</span>
                <span className="text-sm text-gray-600">Listing</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {renderStepContent()}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;