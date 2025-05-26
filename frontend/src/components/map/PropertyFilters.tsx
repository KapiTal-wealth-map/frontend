import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../../services/api';

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  minEstimatedValue?: number;
  maxEstimatedValue?: number;
  minMedianIncome?: number;
  maxMedianIncome?: number;
}

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setActiveFilters] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Update active filters list whenever filters change
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filters.minPrice || filters.maxPrice) {
      newActiveFilters.push('Price');
    }
    
    if (filters.minSize || filters.maxSize) {
      newActiveFilters.push('Size');
    }
    
    if (filters.minBeds || filters.maxBeds) {
      newActiveFilters.push('Bedrooms');
    }
    
    if (filters.minBaths || filters.maxBaths) {
      newActiveFilters.push('Bathrooms');
    }
    
    if (filters.city || filters.state || filters.zip || filters.county) {
      newActiveFilters.push('Location');
    }
    
    if (filters.minEstimatedValue || filters.maxEstimatedValue) {
      newActiveFilters.push('Estimated Value');
    }
    
    if (filters.minMedianIncome || filters.maxMedianIncome) {
      newActiveFilters.push('Median Income');
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: name === 'city' || name === 'state' || name === 'zip' || name === 'county' ? value : Number(value)
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Apply filters through the API
      await propertyAPI.filterProperties(localFilters);
      
      // Update parent component with new filters
      onFilterChange(localFilters);
      onApplyFilters();
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      minBeds: undefined,
      maxBeds: undefined,
      minBaths: undefined,
      maxBaths: undefined,
      city: '',
      state: '',
      zip: '',
      county: '',
      minEstimatedValue: undefined,
      maxEstimatedValue: undefined,
      minMedianIncome: undefined,
      maxMedianIncome: undefined,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
    onResetFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Property Filters</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Price Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minPrice"
                    value={localFilters.minPrice || ''}
                    onChange={handleInputChange}
                    placeholder="Min Price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxPrice"
                    value={localFilters.maxPrice || ''}
                    onChange={handleInputChange}
                    placeholder="Max Price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Size Range */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Size Range (sq ft)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minSize"
                    value={localFilters.minSize || ''}
                    onChange={handleInputChange}
                    placeholder="Min Size"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxSize"
                    value={localFilters.maxSize || ''}
                    onChange={handleInputChange}
                    placeholder="Max Size"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minBeds"
                    value={localFilters.minBeds || ''}
                    onChange={handleInputChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxBeds"
                    value={localFilters.maxBeds || ''}
                    onChange={handleInputChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minBaths"
                    value={localFilters.minBaths || ''}
                    onChange={handleInputChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxBaths"
                    value={localFilters.maxBaths || ''}
                    onChange={handleInputChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={localFilters.city || ''}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={localFilters.state || ''}
                onChange={handleInputChange}
                placeholder="Enter state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={localFilters.zip || ''}
                onChange={handleInputChange}
                placeholder="Enter ZIP code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">County</label>
              <input
                type="text"
                name="county"
                value={localFilters.county || ''}
                onChange={handleInputChange}
                placeholder="Enter county"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estimated Value */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Estimated Value</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minEstimatedValue"
                    value={localFilters.minEstimatedValue || ''}
                    onChange={handleInputChange}
                    placeholder="Min Value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxEstimatedValue"
                    value={localFilters.maxEstimatedValue || ''}
                    onChange={handleInputChange}
                    placeholder="Max Value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Median Income */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Median Income</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    name="minMedianIncome"
                    value={localFilters.minMedianIncome || ''}
                    onChange={handleInputChange}
                    placeholder="Min Income"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxMedianIncome"
                    value={localFilters.maxMedianIncome || ''}
                    onChange={handleInputChange}
                    placeholder="Max Income"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : (
                'Apply Filters'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
