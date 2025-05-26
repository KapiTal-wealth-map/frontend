import React, { useEffect, useState } from 'react';
import type { Property } from '../../services/api';
import { propertyAPI, favoriteAPI } from '../../services/api';
import image from '../../assets/house.png'

interface PropertyDetailProps {
  property: Property | null;
  onClose: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedProperty, setDetailedProperty] = useState<Property | null>(property);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!property) return;
      
      try {
        setLoading(true);
        setError(null);
        const details = await propertyAPI.getPropertyById(property.id);
        // Add dummy owner data if not present
        if (!details.owner) {
          details.owner = {
            id: 'dummy-owner-id',
            age: 45,
            email: "john@smith.com",
            phone: "123-456-7890",
            name: "John Smith",
            netWorth: 2500000,
            occupation: "Tech Executive",
            purchaseDate: "2022-06-15",
          };
        }
        setDetailedProperty(details);
      } catch (err) {
        setError('Failed to load property details. Please try again.');
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [property]);

  if (!property) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Property detail modal content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{property.address}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading property details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <img src={image} className="object-cover w-full h-full rounded-lg"></img>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Property Details</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">{formatCurrency(property.price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Size</p>
                        <p className="font-medium">{property.livingSpace.toLocaleString()} sq ft</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                        <p className="font-medium">{property.beds}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-medium">{property.baths}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {detailedProperty?.owner && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Owner Information</h3>
                    <div className="mt-2 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-3">
                          {detailedProperty.owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{detailedProperty.owner.name}</p>
                          <p className="text-sm text-gray-500">{detailedProperty.owner.occupation}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Estimated Net Worth</p>
                        <p className="font-semibold text-lg">{formatCurrency(detailedProperty.owner.netWorth)}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Purchase Date</p>
                        <p className="font-semibold">{formatDate(detailedProperty.owner.purchaseDate)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* {detailedProperty?.owner?.previousOwners && detailedProperty.owner.previousOwners.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y">
                      {detailedProperty.owner.previousOwners.map((owner, index) => (
                        <div key={index} className="p-3">
                          <p className="text-sm font-medium">{owner.name}</p>
                          <p className="text-xs text-gray-500">
                            Purchased: {formatDate(owner.purchaseDate)}
                            {owner.saleDate && ` • Sold: ${formatDate(owner.saleDate)}`}
                          </p>
                          <p className="font-medium mt-1">{formatCurrency(owner.purchasePrice)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={async () => {
                      await favoriteAPI.addFavorite([property.id])
                      alert('Property added to favorites!');
                    }}>
                      Save Property
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
