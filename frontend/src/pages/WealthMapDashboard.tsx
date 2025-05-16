import React, { useState, useCallback, useEffect } from 'react';
import MapView from '../components/map/MapView';
import { SavedSearch } from '../components/map/SavedSearch';
import MapLayersControl from '../components/map/MapLayersControl';
import { SaveMapDialog, SavedMapList, type SavedMapView } from '../components/map/SavedMapView';
import { BookmarkedPropertiesList, useBookmarkedProperties } from '../components/map/BookmarkedProperties';
import { PropertyExportModal, usePropertyExport, type ExportFormat } from '../components/map/PropertyExport';
import { PropertyFilters, type PropertyFilters as PropertyFiltersType } from '../components/map/PropertyFilters';
import PropertyDetail from '../components/map/PropertyDetail';
import type { Property } from '../components/map/PropertyMarker';

const WealthMapDashboard: React.FC = () => {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'saved' | 'analytics' | 'bookmarks'>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Map layer states
  const [showProperties, setShowProperties] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  
  // Map filters state
  const [propertyFilters, setPropertyFilters] = useState<PropertyFiltersType>({
    minPrice: undefined,
    maxPrice: undefined,
    minSize: undefined,
    maxSize: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    yearBuiltMin: undefined,
    yearBuiltMax: undefined,
    location: '',
    ownerNetWorthMin: undefined,
    ownerNetWorthMax: undefined,
  });
  
  // Save map dialog state
  const [isSaveMapDialogOpen, setIsSaveMapDialogOpen] = useState(false);
  const [savedMaps, setSavedMaps] = useState<SavedMapView[]>([]);
  
  // Bookmarked properties
  const { 
    bookmarkedProperties, 
    toggleBookmark, 
    isPropertyBookmarked, 
    removeBookmark 
  } = useBookmarkedProperties();
  
  // We'll use the removeBookmark function directly for IDs
  
  // Property export modal
  const {
    isExportModalOpen,
    propertyToExport,
    openExportModal,
    closeExportModal,
    handleExport
  } = usePropertyExport();
  
  // Handler for layer changes to ensure they're properly synchronized
  const handleLayerChange = (layer: 'properties' | 'heatmap' | 'clusters', value: boolean) => {
    switch (layer) {
      case 'properties':
        setShowProperties(value);
        break;
      case 'heatmap':
        setShowHeatmap(value);
        break;
      case 'clusters':
        setShowClusters(value);
        break;
    }
  };

  // Load saved maps from localStorage on component mount
  useEffect(() => {
    const savedMapsString = localStorage.getItem('savedMapViews');
    if (savedMapsString) {
      try {
        const parsedMaps = JSON.parse(savedMapsString);
        setSavedMaps(parsedMaps);
      } catch (e) {
        console.error('Error parsing saved maps:', e);
      }
    }
  }, []);

  // Handle property selection
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  // Handle property bookmark toggle
  const handleToggleBookmark = useCallback((property: Property) => {
    toggleBookmark(property);
  }, [toggleBookmark]);

  // Handle property export
  const handlePropertyExport = useCallback((property: Property) => {
    openExportModal(property);
  }, [openExportModal]);

  // Handle filters
  const handleFilterChange = useCallback((newFilters: PropertyFiltersType) => {
    setPropertyFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    // In a real app, this would apply the filters to the property data
    console.log('Applying filters:', propertyFilters);
  }, [propertyFilters]);

  const handleResetFilters = useCallback(() => {
    setPropertyFilters({
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      yearBuiltMin: undefined,
      yearBuiltMax: undefined,
      location: '',
      ownerNetWorthMin: undefined,
      ownerNetWorthMax: undefined,
    });
  }, []);

  // Map save/load functions
  const handleSaveMap = useCallback((name: string) => {
    // Create new saved map
    const newMap: SavedMapView = {
      id: Date.now().toString(),
      name,
      center: [37.7749, -122.4194], // Just an example, in real app get from map ref
      zoom: 13, // Just an example, in real app get from map ref
      createdAt: new Date().toISOString(),
      filters: propertyFilters
    };
    
    const updatedMaps = [...savedMaps, newMap];
    setSavedMaps(updatedMaps);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedMaps));
    setIsSaveMapDialogOpen(false);
  }, [savedMaps, propertyFilters]);

  const handleLoadMap = useCallback((mapView: SavedMapView) => {
    // In a real app, this would apply the saved map view settings to the map
    console.log('Loading map view:', mapView);
    
    // If the saved map has filters, apply them
    if (mapView.filters) {
      setPropertyFilters(mapView.filters);
    }
    
    // Switch to map tab to show the loaded view
    setActiveTab('map');
  }, []);
  
  const handleDeleteMap = useCallback((id: string) => {
    const updatedMaps = savedMaps.filter(map => map.id !== id);
    setSavedMaps(updatedMaps);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedMaps));
  }, [savedMaps]);
  
  const handleApplySavedSearch = useCallback((searchId: number) => {
    // In a real app, this would fetch the search criteria and apply it to the map
    console.log(`Applying saved search with ID: ${searchId}`);
  }, []);

  const handleSaveCurrentSearch = useCallback((name: string) => {
    // In a real app, this would save the current search criteria to the backend
    console.log(`Saving current search as: ${name}`);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Wealth Map Tools</h2>
            <p className="text-sm text-gray-500">Explore property wealth distribution</p>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'saved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </button>
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'bookmarks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks
            </button>
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-y-auto p-4">
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800">Quick Tips</h3>
                  <ul className="mt-2 text-sm text-blue-700 space-y-1">
                    <li>• Click on markers to view property details</li>
                    <li>• Use filters to narrow down properties</li>
                    <li>• Toggle heat map to see wealth distribution</li>
                    <li>• Save your searches for future reference</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3">Property Filters</h3>
                  <PropertyFilters
                    filters={propertyFilters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                  />
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Map Layers</h3>
                    <button
                      onClick={() => setIsSaveMapDialogOpen(true)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Save Current View
                    </button>
                  </div>
                  <MapLayersControl
                    showProperties={showProperties}
                    onToggleProperties={(value) => handleLayerChange('properties', value)}
                    showHeatmap={showHeatmap}
                    onToggleHeatmap={(value) => handleLayerChange('heatmap', value)}
                    showClusters={showClusters}
                    onToggleClusters={(value) => handleLayerChange('clusters', value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3">Saved Map Views</h3>
                  {savedMaps.length === 0 ? (
                    <p className="text-gray-500">You haven't saved any map views yet.</p>
                  ) : (
                    <SavedMapList
                      savedMaps={savedMaps}
                      onLoad={handleLoadMap}
                      onDelete={handleDeleteMap}
                    />
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3">Saved Searches</h3>
                  <SavedSearch
                    onApplySavedSearch={handleApplySavedSearch}
                    onSaveCurrentSearch={handleSaveCurrentSearch}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'bookmarks' && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-medium mb-3">Bookmarked Properties</h3>
                {bookmarkedProperties.length === 0 ? (
                  <p className="text-gray-500">You haven't bookmarked any properties yet.</p>
                ) : (
                  <BookmarkedPropertiesList
                    bookmarkedProperties={bookmarkedProperties}
                    onViewProperty={handlePropertySelect}
                    onRemoveBookmark={removeBookmark}
                  />
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Analytics features coming soon</p>
                <p className="text-sm text-gray-400 mt-2">Wealth distribution reports and insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 hover:text-gray-800"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Property Wealth Map</h1>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Export Data
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Share Map
            </button>
          </div>
        </div>

        {/* Map View */}
        <div className="flex-grow">
          <MapView 
            showProperties={showProperties}
            showHeatmap={showHeatmap}
            showClusters={showClusters}
            key={`map-${showProperties}-${showHeatmap}-${showClusters}`} // Re-render map when layer settings change
          />
        </div>
        
        {/* Modals */}
        {selectedProperty && (
          <PropertyDetail 
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
        
        {isSaveMapDialogOpen && (
          <SaveMapDialog
            onSave={handleSaveMap}
            onCancel={() => setIsSaveMapDialogOpen(false)}
          />
        )}
        
        {isExportModalOpen && propertyToExport && (
          <PropertyExportModal
            property={propertyToExport}
            onClose={closeExportModal}
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
};

export default WealthMapDashboard;
