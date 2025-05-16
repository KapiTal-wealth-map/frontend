import React, { useState, useEffect } from 'react';
import type { Property } from './PropertyMarker';

export interface BookmarkedProperty extends Property {
  bookmarkedAt: string;
}

interface BookmarkControlProps {
  property: Property;
  isBookmarked: boolean;
  onToggleBookmark: (property: Property) => void;
}

export const BookmarkControl: React.FC<BookmarkControlProps> = ({ 
  property, 
  isBookmarked, 
  onToggleBookmark 
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleBookmark(property);
      }}
      className={`flex items-center justify-center p-2 rounded-full transition-colors ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark property'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isBookmarked ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
};

interface BookmarkedPropertiesListProps {
  bookmarkedProperties: BookmarkedProperty[];
  onViewProperty: (property: Property) => void;
  onRemoveBookmark: (propertyId: number) => void;
}

export const BookmarkedPropertiesList: React.FC<BookmarkedPropertiesListProps> = ({ 
  bookmarkedProperties, 
  onViewProperty, 
  onRemoveBookmark 
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Bookmarked Properties</h3>
      </div>
      
      {bookmarkedProperties.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No bookmarked properties</p>
          <p className="text-sm mt-1">Bookmark properties to quickly access them later</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {bookmarkedProperties.map((property) => (
            <li key={property.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="cursor-pointer" onClick={() => onViewProperty(property)}>
                  <h4 className="font-medium text-gray-800">{property.address}</h4>
                  <p className="text-sm text-gray-600">{formatCurrency(property.price)} • {property.sqft} sq ft</p>
                  <p className="text-sm text-gray-500">
                    {property.bedrooms} bed • {property.bathrooms} bath • Built in {property.yearBuilt}
                  </p>
                </div>
                <BookmarkControl 
                  property={property}
                  isBookmarked={true}
                  onToggleBookmark={() => onRemoveBookmark(property.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Utility function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Hook to manage bookmarked properties
export const useBookmarkedProperties = () => {
  const [bookmarkedProperties, setBookmarkedProperties] = useState<BookmarkedProperty[]>(() => {
    // Get bookmarked properties from local storage, if available
    const bookmarkedString = localStorage.getItem('bookmarkedProperties');
    return bookmarkedString ? JSON.parse(bookmarkedString) : [];
  });
  
  // Update local storage whenever bookmarked properties change
  useEffect(() => {
    localStorage.setItem('bookmarkedProperties', JSON.stringify(bookmarkedProperties));
  }, [bookmarkedProperties]);
  
  const toggleBookmark = (property: Property) => {
    const isBookmarked = bookmarkedProperties.some(p => p.id === property.id);
    
    if (isBookmarked) {
      // Remove from bookmarks
      setBookmarkedProperties(bookmarkedProperties.filter(p => p.id !== property.id));
      return false;
    } else {
      // Add to bookmarks
      const bookmarkedProperty: BookmarkedProperty = {
        ...property,
        bookmarkedAt: new Date().toISOString()
      };
      setBookmarkedProperties([...bookmarkedProperties, bookmarkedProperty]);
      return true;
    }
  };
  
  const isPropertyBookmarked = (propertyId: number) => {
    return bookmarkedProperties.some(p => p.id === propertyId);
  };
  
  const removeBookmark = (propertyId: number) => {
    setBookmarkedProperties(bookmarkedProperties.filter(p => p.id !== propertyId));
  };
  
  return {
    bookmarkedProperties,
    toggleBookmark,
    isPropertyBookmarked,
    removeBookmark
  };
};
