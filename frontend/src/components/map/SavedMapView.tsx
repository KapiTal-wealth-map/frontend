import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

// Mock data structure for saved map views
export interface SavedMapView {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  createdAt: string;
  filters?: any;
}

interface SaveMapDialogProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

export const SaveMapDialog: React.FC<SaveMapDialogProps> = ({ onSave, onCancel }) => {
  const [mapName, setMapName] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Save Current Map View</h2>
        
        <div className="mb-4">
          <label htmlFor="map-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="map-name"
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="My Favorite Properties"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(mapName)}
            disabled={!mapName.trim()}
            className={`px-4 py-2 rounded-md ${!mapName.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface SavedMapListProps {
  savedMaps: SavedMapView[];
  onLoad: (mapView: SavedMapView) => void;
  onDelete: (id: string) => void;
}

export const SavedMapList: React.FC<SavedMapListProps> = ({ savedMaps, onLoad, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Saved Map Views</h3>
      </div>
      
      {savedMaps.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No saved map views yet</p>
          <p className="text-sm mt-1">Save your current view to quickly return to it later</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {savedMaps.map((map) => (
            <li key={map.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">{map.name}</h4>
                  <p className="text-sm text-gray-500">
                    Saved on {new Date(map.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onLoad(map)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    aria-label={`Load ${map.name}`}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDelete(map.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    aria-label={`Delete ${map.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Hook to save and manage map views
export const useSavedMapViews = () => {
  const [savedMaps, setSavedMaps] = useState<SavedMapView[]>(() => {
    // Get saved maps from local storage, if available
    const savedMapString = localStorage.getItem('savedMapViews');
    return savedMapString ? JSON.parse(savedMapString) : [];
  });
  
  const map = useMap();
  
  const saveCurrentView = (name: string) => {
    const center = map.getCenter();
    const newSavedMap: SavedMapView = {
      id: Date.now().toString(),
      name,
      center: [center.lat, center.lng],
      zoom: map.getZoom(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedMaps = [...savedMaps, newSavedMap];
    setSavedMaps(updatedMaps);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedMaps));
    
    return newSavedMap;
  };
  
  const loadSavedView = (mapView: SavedMapView) => {
    map.setView(mapView.center, mapView.zoom);
  };
  
  const deleteSavedView = (id: string) => {
    const updatedMaps = savedMaps.filter(map => map.id !== id);
    setSavedMaps(updatedMaps);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedMaps));
  };
  
  return {
    savedMaps,
    saveCurrentView,
    loadSavedView,
    deleteSavedView
  };
};
