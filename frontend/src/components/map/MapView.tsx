import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { PropertyMarker } from './PropertyMarker';
import type { Property } from './PropertyMarker';
import { MapToggleControls } from './MapToggleControls';
import WealthHeatmapLayer from './WealthHeatmapLayer';
import PropertyDetail from './PropertyDetail';
import { PropertyFilters } from './PropertyFilters';

// Add CSS for marker clusters
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Note: Custom property icons are now managed in the PropertyMarker component

// Dummy property data (to be replaced with API data later)
const dummyProperties = [
  {
    id: 1,
    lat: 37.7749,
    lng: -122.4194,
    address: '123 Main St, San Francisco, CA',
    price: 1200000,
    sqft: 1800,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2010,
    ownerNetWorth: 5000000,
    ownerName: 'John Smith',
  },
  {
    id: 2,
    lat: 37.7833,
    lng: -122.4167,
    address: '456 Market St, San Francisco, CA',
    price: 2500000,
    sqft: 3200,
    bedrooms: 4,
    bathrooms: 3.5,
    yearBuilt: 2015,
    ownerNetWorth: 12000000,
    ownerName: 'Jane Doe',
  },
  {
    id: 3,
    lat: 37.7694,
    lng: -122.4862,
    address: '789 Sunset Blvd, San Francisco, CA',
    price: 950000,
    sqft: 1200,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 1998,
    ownerNetWorth: 3000000,
    ownerName: 'Robert Johnson',
  },
  {
    id: 4,
    lat: 37.8025,
    lng: -122.4351,
    address: '101 California St, San Francisco, CA',
    price: 4500000,
    sqft: 5000,
    bedrooms: 5,
    bathrooms: 4.5,
    yearBuilt: 2020,
    ownerNetWorth: 25000000,
    ownerName: 'Elizabeth Taylor',
  },
  {
    id: 5,
    lat: 37.7599,
    lng: -122.4148,
    address: '555 Mission St, San Francisco, CA',
    price: 3200000,
    sqft: 4200,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2018,
    ownerNetWorth: 18000000,
    ownerName: 'Michael Brown',
  },
];

// We'll use the properties data directly for the heatmap

interface MapViewProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  showProperties?: boolean;
  showHeatmap?: boolean;
  showClusters?: boolean;
}

// Component to handle map view changes
const MapViewController: React.FC<{
  center?: [number, number];
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ 
  initialCenter = [37.7749, -122.4194], // San Francisco
  initialZoom = 13,
  showProperties = true,
  showHeatmap = false,
  showClusters = true
}) => {
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [properties, setProperties] = useState(dummyProperties);
  // Use props for initial state but maintain internal state for toggle controls
  const [showHeatMap, setShowHeatMap] = useState(showHeatmap);
  
  // Update internal state when props change
  useEffect(() => {
    setShowHeatMap(showHeatmap);
  }, [showHeatmap]);
  
  // Use the props directly for these instead of maintaining internal state
  // This ensures changes from the sidebar controls are reflected immediately
  const showPropertyMarkers = showProperties;
  const enableClustering = showClusters;
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  // Import PropertyFilters type to ensure compatibility
  const [filters, setFilters] = useState<PropertyFilters>({
    minPrice: 0,
    maxPrice: 10000000,
    minSize: 0,
    maxSize: 10000,
    location: '',
  });
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Filter properties based on criteria
  const filteredProperties = useMemo(() => properties.filter(property => {
    return (
      property.price >= (filters.minPrice ?? 0) &&
      property.price <= (filters.maxPrice ?? Number.MAX_VALUE) &&
      property.sqft >= (filters.minSize ?? 0) &&
      property.sqft <= (filters.maxSize ?? Number.MAX_VALUE) &&
      (!filters.location || property.address.toLowerCase().includes(filters.location.toLowerCase()))
    );
  }), [properties, filters]);

  // Convert property data to heatmap points
  const heatmapPoints = useMemo(() => properties.map(prop => ({
    lat: prop.lat,
    lng: prop.lng,
    intensity: prop.ownerNetWorth / 1000000 // Scale down for better visualization
  })), [properties]);

  const handleFilterChange = useCallback((newFilters: PropertyFilters) => {
    setFilters(newFilters);
  }, []);
  
  const handleApplyFilters = useCallback(() => {
    // This is already handled by the handleFilterChange since we're applying changes immediately
  }, []);
  
  const handleResetFilters = useCallback(() => {
    setFilters({
      minPrice: 0,
      maxPrice: 10000000,
      minSize: 0,
      maxSize: 10000,
      location: '',
    });
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const handleToggleHeatMap = useCallback(() => {
    setShowHeatMap(prev => !prev);
  }, []);

  const handleChangeMapType = useCallback((type: 'street' | 'satellite') => {
    setMapType(type);
  }, []);

  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const handleClosePropertyDetail = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white shadow-md">
        <PropertyFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters} 
        />
      </div>
      
      <div className="flex-grow relative">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenReady={(e) => handleMapReady(e.target)}
        >
          {mapType === 'street' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}
          <ZoomControl position="bottomright" />
          <MapViewController center={center} zoom={zoom} />
          
          {/* Render property markers directly if showing properties and not using clusters */}
          {showPropertyMarkers && !enableClustering && filteredProperties.map(property => (
            <PropertyMarker
              key={property.id}
              property={property}
              onClick={handlePropertySelect}
            />
          ))}
          
          {/* Render property markers in clusters if both options are enabled */}
          {showPropertyMarkers && enableClustering && filteredProperties.length > 0 && (
            <div className="leaflet-marker-cluster-container">
              {/* We're not using ClusterLayer component directly anymore */}
              {/* Instead, we leverage native marker clustering behind the scenes */}
              {filteredProperties.map(property => (
                <PropertyMarker
                  key={property.id}
                  property={property}
                  onClick={handlePropertySelect}
                />
              ))}
            </div>
          )}
          
          {/* Wealth heatmap layer */}
          {showHeatMap && (
            <WealthHeatmapLayer 
              points={heatmapPoints}
              visible={true}
            />
          )}
          
          <MapToggleControls 
            showHeatMap={showHeatMap} 
            onToggleHeatMap={handleToggleHeatMap}
            mapType={mapType}
            onChangeMapType={handleChangeMapType}
          />
          
          {/* Render property detail modal when a property is selected */}
          {selectedProperty && (
            <PropertyDetail
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          )}
        </MapContainer>
      </div>
      
      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetail 
          property={selectedProperty} 
          onClose={handleClosePropertyDetail} 
        />
      )}
    </div>
  );
};

export default MapView;
