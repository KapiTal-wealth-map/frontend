import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapView from '../components/map/MapView';
import SavedSearch from '../components/map/SavedSearch';
import MapLayersControl from '../components/map/MapLayersControl';
import { SaveMapDialog, SavedMapList, type SavedMapView } from '../components/map/SavedMapView';
import { BookmarkedPropertiesList, useBookmarkedProperties } from '../components/map/BookmarkedProperties';
import { PropertyFilters } from '../components/map/PropertyFilters';
import PropertyDetail from '../components/map/PropertyDetail';
import { type Property, type PropertyFilters as APIPropertyFilters, mapViewAPI } from '../services/api';

interface SavedSearchData {
  id: string;
  name: string;
  filters: APIPropertyFilters;
  createdAt: string;
}

const WealthMapDashboard: React.FC = () => {
  const location = useLocation();
  const initialCenter = location.state?.center;
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'saved' | 'analytics' | 'bookmarks'>(
    location.state?.activeTab || 'map'
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    initialCenter ? [initialCenter.lat, initialCenter.lng] : undefined
  );
  const [savedSearches, setSavedSearches] = useState<SavedSearchData[]>([]);
  const [companySavedMaps, setCompanySavedMaps] = useState<SavedMapView[]>([]);
  const [showCompanySaves, setShowCompanySaves] = useState(false);
  
  // Map layer states
  const [showProperties, setShowProperties] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Map filters state
  const [propertyFilters, setPropertyFilters] = useState<APIPropertyFilters>({
    minPrice: undefined,
    maxPrice: undefined,
    minSize: undefined,
    maxSize: undefined,
    minBeds: undefined,
    maxBeds: undefined,
    minBaths: undefined,
    maxBaths: undefined,
    county: '',
    region: '',
    zip: '',
    minEstimatedValue: undefined,
    maxEstimatedValue: undefined,
    minMedianIncome: undefined,
    maxMedianIncome: undefined,
  });
  
  // Save map dialog state
  const [isSaveMapDialogOpen, setIsSaveMapDialogOpen] = useState(false);
  const [savedMaps, setSavedMaps] = useState<SavedMapView[]>([]);
  
  // Bookmarked properties
  const { 
    bookmarkedProperties, 
    removeBookmark 
  } = useBookmarkedProperties();
  
  // We'll use the removeBookmark function directly for IDs
  
  // Handler for layer changes to ensure they're properly synchronized
  const handleLayerChange = (layer: 'properties' | 'heatmap' | 'clusters', value: boolean) => {
    switch (layer) {
      case 'properties':
        setShowProperties(value);
        break;
      case 'heatmap':
        setShowHeatmap(value);
        break;
    }
  };

  // Load saved maps from localStorage on component mount
  useEffect(() => {
    const fetchSavedMaps = async () => {
      const savedMaps = await mapViewAPI.getSavedMapViews();
      if (savedMaps) {
        try {
          const userViews = savedMaps.filter((map: SavedMapView) => map.scope === 'private');
          const companyViews = savedMaps.filter((map: SavedMapView) => map.scope === 'company');
          setSavedMaps(userViews);
          setCompanySavedMaps(companyViews);
        } catch (e) {
          console.error('Error parsing saved maps:', e);
        }
      }
    };
    fetchSavedMaps();
  }, []);

  // Load saved searches from localStorage
  useEffect(() => {
    const savedSearchesJson = localStorage.getItem('savedPropertySearches');
    if (savedSearchesJson) {
      try {
        const loadedSearches = JSON.parse(savedSearchesJson) as SavedSearchData[];
        setSavedSearches(loadedSearches);
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, []);

  // Handle property selection
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  // Handle filters
  const handleFilterChange = useCallback((newFilters: APIPropertyFilters) => {
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
      minBeds: undefined,
      maxBeds: undefined,
      minBaths: undefined,
      maxBaths: undefined,
      county: '',
      region: '',
      zip: '',
      minEstimatedValue: undefined,
      maxEstimatedValue: undefined,
      minMedianIncome: undefined,
      maxMedianIncome: undefined,
    });
  }, []);

  // Map save/load functions
  const handleSaveMap = useCallback(async (name: string) => {
    // Create new saved map
    const newMap: SavedMapView = {
      id: Date.now().toString(),
      name,
      center: mapCenter || [39.8283,-98.5795,], // Use current center or default to LA
      zoom: 4,
      createdAt: new Date().toISOString(),
      filters: propertyFilters,
      showProperties,
      showHeatmap,
      scope: 'private', // Use current scope (private or company)
    };
    
    const updatedMaps = [...savedMaps, newMap];
    setSavedMaps(updatedMaps);
    await mapViewAPI.saveMapView(newMap);
    setIsSaveMapDialogOpen(false);
  }, [savedMaps, propertyFilters, mapCenter, showProperties, showHeatmap]);

  const handleLoadMap = useCallback((mapView: SavedMapView) => {
    // Apply the saved map view settings to the map
    setMapCenter(mapView.center);
    
    // Restore map layer states
    setShowProperties(mapView.showProperties ?? true);
    setShowHeatmap(mapView.showHeatmap ?? false);
    
    // If the saved map has filters, apply them
    if (mapView.filters) {
      setPropertyFilters(mapView.filters);
    }
    
    // Switch to map tab to show the loaded view
    setActiveTab('map');
  }, []);
  
  const handleDeleteMap = useCallback(async (id: string) => {
    const updatedMaps = savedMaps.filter(map => map.id !== id);
    setSavedMaps(updatedMaps);
    await mapViewAPI.deleteSavedMapView(id);
  }, [savedMaps]);

  const handleSaveMapToCompany = useCallback((name: string) => {
  const newMap: SavedMapView = {
    id: Date.now().toString(),
    name,
    center: mapCenter || [39.8283, -98.5795], // default center if undefined
    zoom: 4,
    createdAt: new Date().toISOString(),
    filters: propertyFilters,
    showProperties,
    showHeatmap,
    scope: 'company', // Save as company scope
  };

  const updatedCompanyMaps = [...companySavedMaps, newMap];
  setCompanySavedMaps(updatedCompanyMaps);
  mapViewAPI.saveMapView(newMap);
  setIsSaveMapDialogOpen(false);

  console.log('Saved map view for company:', newMap);
}, [companySavedMaps, propertyFilters, mapCenter, showProperties, showHeatmap]);
  
  const handleApplySavedSearch = useCallback((filters: APIPropertyFilters) => {
    setPropertyFilters(filters);
    setActiveTab('map'); // Switch to map tab to show the results
  }, []);

  const handleSaveCurrentSearch = useCallback((name: string, filters: APIPropertyFilters) => {
    const newSearch: SavedSearchData = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString()
    };
    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedPropertySearches', JSON.stringify(updatedSearches));
  }, [savedSearches]);

  const handleDeleteSavedSearch = useCallback((id: string) => {
    const updatedSearches = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updatedSearches);
    localStorage.setItem('savedPropertySearches', JSON.stringify(updatedSearches));
  }, [savedSearches]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h2 className="text-xl font-semibold text-white">Wealth Map Tools</h2>
            <p className="text-sm text-white">Explore property wealth distribution</p>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'map' ? 'text-blue-600 border-b-2 border-blue-600 -mb-[1px]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
            <button
              className={`flex-1 py-3 text-center ${activeTab === 'saved' ? 'text-blue-600 border-b-2 border-blue-600 -mb-[1px]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </button>
            {/* <button
              className={`flex-1 py-3 text-center ${activeTab === 'bookmarks' ? 'text-blue-600 border-b-2 border-blue-600 -mb-[1px]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks
            </button> */}
            {/* <button
              className={`flex-1 py-3 text-center ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600 -mb-[1px]' : 'text-gray-600'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button> */}
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
                    <div className="space-x-2">
    <button
      onClick={() => setIsSaveMapDialogOpen(true)}
      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
    >
      Save My View
    </button>
    <button
      onClick={() => {
        // Open prompt to get name for company save
        const companySaveName = prompt('Enter name for company-wide saved map view:');
        if (companySaveName) {
          handleSaveMapToCompany(companySaveName);
        }
      }}
      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
    >
      Save to Company
    </button>
  </div>
                  </div>
                  <MapLayersControl
                    showProperties={showProperties}
                    onToggleProperties={(value) => handleLayerChange('properties', value)}
                    showHeatmap={showHeatmap}
                    onToggleHeatmap={(value) => handleLayerChange('heatmap', value)}
                    // showClusters={showClusters}
                    // onToggleClusters={(value) => handleLayerChange('clusters', value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium mb-3">Saved Map Views</h3>
          <button
            onClick={() => setShowCompanySaves(!showCompanySaves)}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            {showCompanySaves ? 'View Your Saves' : 'View Company Saves'}
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          {showCompanySaves ? (
            companySavedMaps.length === 0 ? (
              <p className="text-gray-500">No company saved views available.</p>
            ) : (
              <SavedMapList
                savedMaps={companySavedMaps}
                onLoad={handleLoadMap}
                onDelete={() => alert('Company saves cannot be deleted here')}
              />
            )
          ) : (
            savedMaps.length === 0 ? (
              <p className="text-gray-500">You haven't saved any map views yet.</p>
            ) : (
              <SavedMapList
                savedMaps={savedMaps}
                onLoad={handleLoadMap}
                onDelete={handleDeleteMap}
              />
            )
          )}
        </div>

        {/* Saved Searches remain the same */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium mb-3">Saved Searches</h3>
          <SavedSearch
            onApplySavedSearch={handleApplySavedSearch}
            onSaveCurrentSearch={handleSaveCurrentSearch}
            onDeleteSavedSearch={handleDeleteSavedSearch}
            currentFilters={propertyFilters}
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
            initialCenter={mapCenter}
            filters={propertyFilters}
            key={`map-${showProperties}-${showHeatmap}-${mapCenter?.join(',')}`}
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
      </div>
    </div>
  );
};

export default WealthMapDashboard;
