import React, { useState, useEffect } from 'react';
import type { PropertyFilters } from '../../services/api';

interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  createdAt: string;
}

interface SavedSearchProps {
  onApplySavedSearch: (filters: PropertyFilters) => void;
  onSaveCurrentSearch: (name: string, filters: PropertyFilters) => void;
  onDeleteSavedSearch: (id: string) => void;
  currentFilters: PropertyFilters;
}

const SavedSearch: React.FC<SavedSearchProps> = ({ 
  onApplySavedSearch, 
  onSaveCurrentSearch,
  onDeleteSavedSearch,
  currentFilters 
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const savedSearchesString = localStorage.getItem('savedPropertySearches');
    if (savedSearchesString) {
      try {
        const parsedSearches = JSON.parse(savedSearchesString);
        setSavedSearches(parsedSearches);
      } catch (e) {
        console.error('Error parsing saved searches:', e);
      }
    }
  }, []);

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      alert('Please enter a name for your search');
      return;
    }

    onSaveCurrentSearch(searchName.trim(), currentFilters);
    setSearchName('');
    setIsSaving(false);
  };

  const handleDeleteSearch = (id: string) => {
    onDeleteSavedSearch(id);
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {savedSearches.length === 0 ? (
        <p className="text-gray-500 text-sm">No saved searches yet.</p>
      ) : (
        <div className="space-y-2">
          {savedSearches.map(search => (
            <div key={search.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <h4 className="font-medium text-gray-900">{search.name}</h4>
                <p className="text-sm text-gray-500">Saved on {formatDate(search.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onApplySavedSearch(search.filters)}
                  className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Apply
                </button>
                <button
                  onClick={() => handleDeleteSearch(search.id)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSaving ? (
        <div className="space-y-2">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter search name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setIsSaving(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSearch}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSaving(true)}
          className="w-full px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Save Current Search
        </button>
      )}
    </div>
  );
};

export default SavedSearch;
