import React from 'react';

interface MapLayersControlProps {
  showProperties: boolean;
  onToggleProperties: (show: boolean) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
  showClusters: boolean;
  onToggleClusters: (show: boolean) => void;
}

const MapLayersControl: React.FC<MapLayersControlProps> = ({
  showProperties,
  onToggleProperties,
  showHeatmap,
  onToggleHeatmap,
  showClusters,
  onToggleClusters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium text-gray-800 mb-3">Map Layers</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="properties-layer"
            checked={showProperties}
            onChange={(e) => onToggleProperties(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="properties-layer" className="text-sm text-gray-700">
            Properties
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="heatmap-layer"
            checked={showHeatmap}
            onChange={(e) => onToggleHeatmap(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="heatmap-layer" className="text-sm text-gray-700">
            Wealth Heatmap
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="clusters-layer"
            checked={showClusters}
            onChange={(e) => onToggleClusters(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="clusters-layer" className="text-sm text-gray-700">
            Property Clusters
          </label>
        </div>
      </div>
    </div>
  );
};

export default MapLayersControl;
