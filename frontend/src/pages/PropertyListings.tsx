import React, { useState, useEffect } from 'react';
import { propertyAPI, favoriteAPI } from '../services/api';
import type { Property } from '../services/api';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const PropertyListings: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Property>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // array of favorited property IDs
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    county: '',
    region: '',
    beds: '',
    baths: '',
  });

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, [currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAllProperties(currentPage, ITEMS_PER_PAGE);
      setProperties(response?.data || []);
      setTotalItems(response?.total || 0);
    } catch (err) {
      setError('Failed to fetch properties. Please try again later.');
      console.error('Error fetching properties:', err);
      setProperties([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      if (response.status === 200) {
        const favoriteIds = response.data.map((prop: { propertyId: string; }) => prop.propertyId);
        setFavorites(favoriteIds);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFavorited = (id: string) => {
    if (favorites.length === 0) return false;
    return favorites.includes(id);
  }

  const handleToggleFavorite = async (property: Property) => {
    const isSaved = isFavorited(property.id);
    if (isSaved) {
      const response = await favoriteAPI.removeFavorite([property.id]);
      if (response.status == 200) {
        alert(`Successfully removed ${property.address} from favorites!`);
      }
      else {
        alert(`Failed to remove ${property.address} from favorites!`);
      }
    }
    else {
      const response = await favoriteAPI.addFavorite([property.id]);
      if (response.status == 201) {
        alert(`Successfully added ${property.address} to favorites!`);
      }
      else {
        alert(`Failed to add ${property.address} to favorites!`);
      }
    }
    setFavorites((prev) =>
      isSaved ? prev.filter(id => id !== property.id) : [...prev, property.id]
    );
  };
  const handleBulkFavorite = async (ids: string[]) => {
    if (ids.length === 0) return;
    const response = await favoriteAPI.addFavorite(ids);
    if (response.status === 201) {
      setFavorites(prev => [...new Set([...prev, ...ids])]);
      alert('Favorites added successfully!');
    } else {
      console.error('Failed to add favorites');
    }
  };

  const handleBulkUnfavorite = async (ids: string[]) => {
    if (ids.length === 0) return;
    const response = await favoriteAPI.removeFavorite(ids);
    if (response.status === 200) {
      setFavorites(prev => prev.filter(id => !ids.includes(id)));
      alert('Favorites removed successfully!');
    } else {
      console.error('Failed to remove favorites');
    }
    setFavorites(prev => prev.filter(id => !ids.includes(id)));
  };



  const handleSort = (field: keyof Property) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const filteredAndSortedProperties = (properties || [])
    .filter(property => {
      if (!property) return false;
      const hasActiveFilters = Object.values(filters).some(value => value !== '');
      
      if (!hasActiveFilters) return true; // Show all properties if no filters are active
      
      return (
        (!filters.minPrice || property.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || property.price <= Number(filters.maxPrice)) &&
        (!filters.county || property.county.toLowerCase().includes(filters.county.toLowerCase())) &&
        (!filters.region || property.regionName.toLowerCase().includes(filters.region.toLowerCase())) &&
        (!filters.beds || property.beds >= Number(filters.beds)) &&
        (!filters.baths || property.baths >= Number(filters.baths))
      );
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Property Listings</h1>
        <Link
          to="/wealth-map"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View on Map
        </Link>
        <Link
          to="/favourite-properties"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Favourite Properties
        </Link>
        <div>
          <button
            onClick={() => handleBulkFavorite(selectedIds)}
            className={`px-4 py-2 text-white rounded transition 
              ${selectedIds.length === 0 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
            disabled={selectedIds.length === 0}
          >
            Save Selected
          </button>
          <button
            onClick={() => handleBulkUnfavorite(selectedIds)}
            className={`px-4 py-2 text-white rounded transition 
              ${selectedIds.length === 0 
                ? 'bg-red-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'}
            `}
            disabled={selectedIds.length === 0}
          >
            Unsave Selected
          </button>
        </div>


      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="county"
                value={filters.county}
                onChange={handleFilterChange}
                placeholder="County"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                placeholder="Region"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bedrooms & Bathrooms</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="beds"
                value={filters.beds}
                onChange={handleFilterChange}
                placeholder="Min Beds"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                name="baths"
                value={filters.baths}
                onChange={handleFilterChange}
                placeholder="Min Baths"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === properties.length}
                    onChange={() => {
                      if (selectedIds.length === properties.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(properties.map(property => property.id));
                      }
                    }}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('address')}
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('livingSpace')}
                >
                  Size (sq ft)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('beds')}
                >
                  Beds
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('baths')}
                >
                  Baths
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('zhvi')}
                >
                  Estimated Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('medianHouseholdIncome')}
                >
                  Median Income
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View on Map
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Save to Favorites
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(property.id)}
                    onChange={() => toggleSelection(property.id)}
                  />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.address}</div>
                    <div className="text-sm text-gray-500">
                      {property.regionName} {property.zipCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.livingSpace.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.beds}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.baths}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.zhvi[property.zhvi.length - 1])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.medianHouseholdIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to="/wealth-map"
                      state={{ center: { lat: property.latitude, lng: property.longitude } }}
                      className="text-green-600 hover:text-green-900"
                    >
                      View on Map
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleFavorite(property)}
                      className={`px-3 py-1 rounded ${isFavorited(property.id) ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    >
                      {isFavorited(property.id) ? 'Unsave' : 'Save'}
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListings; 