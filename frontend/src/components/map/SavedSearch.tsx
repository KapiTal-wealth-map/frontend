import React, { useState } from 'react';

interface SavedSearchProps {
  onApplySavedSearch: (searchId: number) => void;
  onSaveCurrentSearch: (name: string) => void;
}

// Dummy saved searches data (to be replaced with API data later)
const dummySavedSearches = [
  {
    id: 1,
    name: 'High-value SF Properties',
    criteria: {
      minPrice: 2000000,
      maxPrice: 10000000,
      minSize: 2000,
      maxSize: 10000,
      location: 'San Francisco',
    },
    createdAt: '2025-05-10T12:00:00Z',
  },
  {
    id: 2,
    name: 'Mid-size Oakland Properties',
    criteria: {
      minPrice: 800000,
      maxPrice: 1500000,
      minSize: 1000,
      maxSize: 2000,
      location: 'Oakland',
    },
    createdAt: '2025-05-12T15:30:00Z',
  },
  {
    id: 3,
    name: 'Luxury Waterfront',
    criteria: {
      minPrice: 3000000,
      maxPrice: 10000000,
      minSize: 3000,
      maxSize: 10000,
      location: 'Waterfront',
    },
    createdAt: '2025-05-14T09:15:00Z',
  },
];

export const SavedSearch: React.FC<SavedSearchProps> = ({
  onApplySavedSearch,
  onSaveCurrentSearch,
}) => {
  const [savedSearches, setSavedSearches] = useState(dummySavedSearches);
  const [newSearchName, setNewSearchName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSaveSearch = () => {
    if (newSearchName.trim()) {
      onSaveCurrentSearch(newSearchName);
      setNewSearchName('');
      setIsAddingNew(false);
      
      // In a real app, we would update the savedSearches state after API call success
      // For now, we'll just simulate it
      const newId = Math.max(...savedSearches.map(s => s.id)) + 1;
      setSavedSearches([
        ...savedSearches,
        {
          id: newId,
          name: newSearchName,
          criteria: {
            minPrice: 0,
            maxPrice: 10000000,
            minSize: 0,
            maxSize: 10000,
            location: '',
          },
          createdAt: new Date().toISOString(),
        }
      ]);
    }
  };

  const handleDeleteSearch = (id: number) => {
    setSavedSearches(savedSearches.filter(search => search.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Save Current Search
          </button>
        )}
      </div>

      {isAddingNew && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center">
            <input
              type="text"
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="Enter search name"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="ml-2 flex space-x-2">
              <button
                onClick={handleSaveSearch}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewSearchName('');
                }}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {savedSearches.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No saved searches yet</p>
        ) : (
          savedSearches.map((search) => (
            <div
              key={search.id}
              className="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{search.name}</h4>
                  <p className="text-xs text-gray-500">Saved on {formatDate(search.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onApplySavedSearch(search.id)}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <p>
                  Price: ${search.criteria.minPrice.toLocaleString()} - $
                  {search.criteria.maxPrice.toLocaleString()}
                </p>
                <p>
                  Size: {search.criteria.minSize.toLocaleString()} - {search.criteria.maxSize.toLocaleString()} sq ft
                </p>
                {search.criteria.location && <p>Location: {search.criteria.location}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
