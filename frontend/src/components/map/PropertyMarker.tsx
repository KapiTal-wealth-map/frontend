import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Property } from '../../services/api';

interface PropertyMarkerProps {
  property: Property;
  onClick: (property: Property) => void;
}

// Custom property icon based on property value
const getPropertyIcon = (price: number) => {
  // Color based on property value
  const color = price > 3000000 ? '#FF4500' : // Expensive
              price > 1500000 ? '#FFA500' : // Mid-high
              price > 800000 ? '#32CD32' : // Mid
              '#3388FF'; // Lower price range
  
  return L.divIcon({
    className: 'custom-property-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const PropertyMarker: React.FC<PropertyMarkerProps> = ({ property, onClick }) => {
  // Create a ref to access the marker instance
  const markerRef = React.useRef(null);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Marker
      position={[property.lat, property.lng]} 
      icon={getPropertyIcon(property.price)}
      ref={markerRef}
    >
      <Popup>
        <div className="property-popup">
          <h3 className="font-bold text-lg">{property.address}</h3>
          <div className="mt-2">
            <p><span className="font-semibold">Price:</span> {formatCurrency(property.price)}</p>
            <p><span className="font-semibold">Size:</span> {property.sizeSqFt} sq ft</p>
            <p><span className="font-semibold">Bedrooms:</span> {property.beds}</p>
            <p><span className="font-semibold">Bathrooms:</span> {property.baths}</p>
            <p><span className="font-semibold">Location:</span> {property.city}, {property.state} {property.zip}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p><span className="font-semibold">Estimated Value:</span> {formatCurrency(property.estimatedValue)}</p>
            <p><span className="font-semibold">Median Income:</span> {formatCurrency(property.medianIncome)}</p>
            <p><span className="font-semibold">Population:</span> {property.population.toLocaleString()}</p>
            <p><span className="font-semibold">Density:</span> {property.density.toLocaleString()} per sq mi</p>
          </div>
          <div className="mt-3">
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                // Close the popup before showing the detailed view
                const marker = markerRef.current;
                if (marker) {
                  // @ts-ignore - leaflet type definitions are incomplete
                  marker.closePopup();
                }
                onClick(property);
              }}
              aria-label="View property details"
            >
              View Details
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default PropertyMarker;
