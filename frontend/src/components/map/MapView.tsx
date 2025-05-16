import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import PropertyMarker from './PropertyMarker';
import type { Property, PropertyFilters } from '../../services/api';
import { MapToggleControls } from './MapToggleControls';
import WealthHeatmapLayer from './WealthHeatmapLayer';
import PropertyDetail from './PropertyDetail';
import { propertyAPI } from '../../services/api';
import ClusterLayer from './ClusterLayer';

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

// interface ClusterProperties {
//   center: [number, number];
//   count: number;
// }

interface MapViewProps {
  showProperties: boolean;
  showHeatmap: boolean;
  showClusters: boolean;
  initialCenter?: [number, number];
  filters?: PropertyFilters;
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
  showProperties, 
  showHeatmap, 
  showClusters,
  initialCenter,
  filters 
}) => {
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.[1] || -118.2437,
    latitude: initialCenter?.[0] || 34.0522,
    zoom: 13
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(showHeatmap);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Fetch properties on component mount and when filters change
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await propertyAPI.filterProperties(filters || {});
        setProperties(response);
      } catch (err) {
        setError('Failed to fetch properties. Please try again later.');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  // Filter properties based on criteria
  const filteredProperties = useMemo(() => properties.filter(property => {
    if (!filters) return true;
    
    return (
      property.price >= (filters.minPrice ?? 0) &&
      property.price <= (filters.maxPrice ?? Number.MAX_VALUE) &&
      property.sizeSqFt >= (filters.minSize ?? 0) &&
      property.sizeSqFt <= (filters.maxSize ?? Number.MAX_VALUE) &&
      property.beds >= (filters.minBeds ?? 0) &&
      property.beds <= (filters.maxBeds ?? Number.MAX_VALUE) &&
      property.baths >= (filters.minBaths ?? 0) &&
      property.baths <= (filters.maxBaths ?? Number.MAX_VALUE) &&
      (!filters.city || property.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (!filters.state || property.state.toLowerCase().includes(filters.state.toLowerCase())) &&
      (!filters.zip || property.zip.includes(filters.zip)) &&
      (!filters.county || property.county.toLowerCase().includes(filters.county.toLowerCase())) &&
      property.estimatedValue >= (filters.minEstimatedValue ?? 0) &&
      property.estimatedValue <= (filters.maxEstimatedValue ?? Number.MAX_VALUE) &&
      property.medianIncome >= (filters.minMedianIncome ?? 0) &&
      property.medianIncome <= (filters.maxMedianIncome ?? Number.MAX_VALUE)
    );
  }), [properties, filters]);

  // Convert property data to heatmap points with better intensity calculation
  const heatmapPoints = useMemo(() => {
    if (properties.length === 0) return [];
    
    // Find min and max values for normalization
    const values = properties.map(prop => prop.estimatedValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    return properties.map(prop => ({
      lat: prop.lat,
      lng: prop.lng,
      // Normalize intensity between 0 and 1, with exponential scaling for better visualization
      intensity: Math.pow((prop.estimatedValue - minValue) / range, 0.5)
    }));
  }, [properties]);

  const handleMapReady = useCallback(() => {
    if (mapRef.current) {
      // The map is already available in mapRef.current
      return;
    }
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

  // Update viewState when initialCenter changes
  useEffect(() => {
    if (initialCenter) {
      setViewState(prev => ({
        ...prev,
        longitude: initialCenter[1],
        latitude: initialCenter[0],
        zoom: 13
      }));
    }
  }, [initialCenter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow relative">
        <MapContainer
          center={[viewState.latitude, viewState.longitude]}
          zoom={viewState.zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenReady={handleMapReady}
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
          <MapViewController center={[viewState.latitude, viewState.longitude]} zoom={viewState.zoom} />
          
          {showProperties && showClusters && (
            <ClusterLayer
              properties={filteredProperties}
              onSelectProperty={handlePropertySelect}
              visible={true}
            />
          )}
          
          {showProperties && !showClusters && filteredProperties.map(property => (
            <PropertyMarker
              key={property.id}
              property={property}
              onClick={handlePropertySelect}
            />
          ))}
          
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
        </MapContainer>
      </div>
      
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