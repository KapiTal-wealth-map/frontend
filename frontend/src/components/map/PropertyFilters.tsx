import React, { useState, useEffect } from 'react';

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  location?: string;
  ownerNetWorthMin?: number;
  ownerNetWorthMax?: number;
}

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const priceRanges = [
  { min: 0, max: 500000 },
  { min: 500000, max: 1000000 },
  { min: 1000000, max: 2000000 },
  { min: 2000000, max: 5000000 },
  { min: 5000000, max: 10000000 },
  { min: 10000000, max: null },
];

const sizeRanges = [
  { min: 0, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 2000, max: 3000 },
  { min: 3000, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000, max: null },
];

const bedroomOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const bathroomOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
  
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
    
    if (filters.bedrooms) {
      newActiveFilters.push('Bedrooms');
    }
    
    if (filters.bathrooms) {
      newActiveFilters.push('Bathrooms');
    }
    
    if (filters.yearBuiltMin || filters.yearBuiltMax) {
      newActiveFilters.push('Year Built');
    }
    
    if (filters.location) {
      newActiveFilters.push('Location');
    }
    
    if (filters.ownerNetWorthMin || filters.ownerNetWorthMax) {
      newActiveFilters.push('Owner Net Worth');
    }
    
    setActiveFilters(newActiveFilters);
  }, [filters]);
  
  const handleChange = (key: keyof PropertyFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setLocalFilters(prev => ({
      ...prev,
      [name]: name === 'location' ? value : Number(value)
    }));
  };

  // Apply filters when the Apply button is clicked
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  // Reset filters to default values
  const handleResetFilters = () => {
    const defaultFilters = {
      minPrice: 0,
      maxPrice: 10000000,
      minSize: 0,
      maxSize: 10000,
      location: '',
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-3">
        <h3 className="text-lg font-semibold">Property Filters</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="minPrice"
                  min="0"
                  max="10000000"
                  step="50000"
                  value={localFilters.minPrice}
                  onChange={handleInputChange}
                  className="w-full"
                  title="Minimum price slider"
                  aria-label="Minimum price"
                />
                <span className="text-sm text-gray-600 w-24">
                  {formatCurrency(localFilters.minPrice)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="maxPrice"
                  min="0"
                  max="10000000"
                  step="50000"
                  value={localFilters.maxPrice}
                  onChange={handleInputChange}
                  className="w-full"
                  title="Maximum price slider"
                  aria-label="Maximum price"
                />
                <span className="text-sm text-gray-600 w-24">
                  {formatCurrency(localFilters.maxPrice)}
                </span>
              </div>
            </div>

            {/* Size Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Size Range (sq ft)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="minSize"
                  min="0"
                  max="10000"
                  step="100"
                  value={localFilters.minSize}
                  onChange={handleInputChange}
                  className="w-full"
                  title="Minimum size slider"
                  aria-label="Minimum size"
                />
                <span className="text-sm text-gray-600 w-16">
                  {localFilters.minSize}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="maxSize"
                  min="0"
                  max="10000"
                  step="100"
                  value={localFilters.maxSize}
                  onChange={handleInputChange}
                  className="w-full"
                  title="Maximum size slider"
                  aria-label="Maximum size"
                />
                <span className="text-sm text-gray-600 w-16">
                  {localFilters.maxSize}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={localFilters.location}
                onChange={handleInputChange}
                placeholder="Enter address, city, or zip"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
