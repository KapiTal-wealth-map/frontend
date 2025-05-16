import React from 'react';
import type { Property } from './PropertyMarker';

interface PropertyDetailProps {
  property: Property | null;
  onClose: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  if (!property) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-500">Property Image Placeholder</p>
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
                      <p className="font-medium">{property.sqft.toLocaleString()} sq ft</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year Built</p>
                      <p className="font-medium">{property.yearBuilt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Owner Information</h3>
                <div className="mt-2 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-3">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{property.ownerName}</p>
                      <p className="text-sm text-gray-500">Property Owner</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Estimated Net Worth</p>
                    <p className="font-semibold text-lg">{formatCurrency(property.ownerNetWorth)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
                <div className="mt-2 border border-gray-200 rounded-lg divide-y">
                  <div className="p-3">
                    <p className="text-sm font-medium">Purchase</p>
                    <p className="text-xs text-gray-500">Jan 15, 2020</p>
                    <p className="font-medium mt-1">{formatCurrency(property.price * 0.9)}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium">Previous Sale</p>
                    <p className="text-xs text-gray-500">Mar 22, 2015</p>
                    <p className="font-medium mt-1">{formatCurrency(property.price * 0.7)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save Property
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                    Export Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                    View Wealth Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
