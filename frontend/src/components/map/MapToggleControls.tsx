import React from 'react';
import { useMap } from 'react-leaflet';
import './MapControls.css';

interface MapToggleControlsProps {
  showHeatMap: boolean;
  onToggleHeatMap: () => void;
  mapType: 'street' | 'satellite';
  onChangeMapType: (type: 'street' | 'satellite') => void;
}

export const MapToggleControls: React.FC<MapToggleControlsProps> = ({
  showHeatMap,
  onToggleHeatMap,
  mapType,
  onChangeMapType
}) => {
  const map = useMap();

  // Using CSS classes instead of inline styles

  return (
    <div className="map-toggle-controls">
      <div className="flex flex-col">
        <button
          className={`map-control-button ${showHeatMap ? 'active' : ''}`}
          onClick={onToggleHeatMap}
          title="Toggle Wealth Heat Map"
        >
          {showHeatMap ? 'Hide Heat Map' : 'Show Wealth Heat Map'}
        </button>
        
        <button
          className="map-control-button"
          onClick={() => map.setView([37.7749, -122.4194], 13)}
          title="Reset Map View"
        >
          Reset View
        </button>
        
        <div className="map-control-section">
          <p className="map-control-label">Map Type:</p>
          <button
            className={`map-control-button ${mapType === 'satellite' ? 'active' : ''}`}
            onClick={() => onChangeMapType('satellite')}
            title="Switch to Satellite View"
          >
            Satellite
          </button>
          
          <button
            className={`map-control-button ${mapType === 'street' ? 'active' : ''}`}
            onClick={() => onChangeMapType('street')}
            title="Switch to Street View"
          >
            Street
          </button>
        </div>
      </div>
    </div>
  );
};
