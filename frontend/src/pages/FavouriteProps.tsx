import React, { useEffect, useState } from 'react';
import { propertyAPI, favoriteAPI } from '../services/api';
import type { Property } from '../services/api';
import { Link } from 'react-router-dom';

const FavoriteProps: React.FC = () => {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      const favoriteIds = response.data.map((fav: { propertyId: string }) => fav.propertyId);
      console.log('Favorite IDs:', favoriteIds);
      if (favoriteIds.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      // Fetch full property details for each favorite
      const propertyPromises = favoriteIds.map(async (id: string) => {
        const res = await propertyAPI.getPropertyById(id)
        return res;
      });
      const resolvedProperties = await Promise.all(propertyPromises);
        console.log('Resolved Properties:', resolvedProperties);
        const validProperties = resolvedProperties.filter((property: Property) => property !== null);
      setFavoriteProperties(validProperties);
    } catch (err) {
      console.error('Error fetching favorite properties:', err);
      setError('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (propertyId: string) => {
    const response = await favoriteAPI.removeFavorite([propertyId]);
    if (response.status === 200) {
      setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId));
      alert('Removed from favorites.');
    } else {
      alert('Failed to remove from favorites.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

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
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Favorite Properties</h1>

      {favoriteProperties.length === 0 ? (
        <div className="text-gray-500">No favorites yet. Add some from the listings page!</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Baths</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimated Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Median Income</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Map</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {favoriteProperties.map(property => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.address}</div>
                      <div className="text-sm text-gray-500">
                        {property.regionName} {property.zipCode} - {property.county}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(property.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{property.beds}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{property.baths}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{property.livingSpace.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(property.zhvi[property.zhvi.length - 1])}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(property.medianHouseholdIncome)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        to="/wealth-map"
                        state={{ center: { lat: property.latitude, lng: property.longitude } }}
                        className="text-green-600 hover:text-green-900"
                      >
                        View on Map
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => handleUnfavorite(property.id)}
                        className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500"
                      >
                        Unsave
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoriteProps;
