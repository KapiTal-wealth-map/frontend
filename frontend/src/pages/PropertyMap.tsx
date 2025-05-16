// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import MapView from '../components/map/MapView';
// import { SavedSearch } from '../components/map/SavedSearch';

// interface LocationState {
//   center?: {
//     lat: number;
//     lng: number;
//   };
// }

// const PropertyMap: React.FC = () => {
//   const [showSavedSearches, setShowSavedSearches] = useState(false);
//   const location = useLocation();
//   const locationState = location.state as LocationState;
//   const [initialCenter, setInitialCenter] = useState<[number, number] | undefined>(undefined);

//   useEffect(() => {
//     if (locationState?.center) {
//       setInitialCenter([locationState.center.lat, locationState.center.lng]);
//     }
//   }, [locationState]);

//   const handleApplySavedSearch = (searchId: number) => {
//     // In a real app, this would fetch the search criteria and apply it to the map
//     console.log(`Applying saved search with ID: ${searchId}`);
//     // Then close the saved searches panel
//     setShowSavedSearches(false);
//   };

//   const handleSaveCurrentSearch = (name: string) => {
//     // In a real app, this would save the current search criteria to the backend
//     console.log(`Saving current search as: ${name}`);
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Main content area */}
//       <div className="flex-grow flex flex-col">
//         {/* Header */}
//         <div className="bg-white shadow-sm p-4 flex justify-between items-center">
//           <h1 className="text-2xl font-semibold text-gray-800">Property Wealth Map</h1>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => setShowSavedSearches(!showSavedSearches)}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               {showSavedSearches ? 'Hide Saved Searches' : 'Saved Searches'}
//             </button>
//             <button
//               onClick={() => console.log('Export data')}
//               className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
//             >
//               Export Data
//             </button>
//           </div>
//         </div>

//         {/* Map View */}
//         <div className="flex-grow">
//           <MapView initialCenter={initialCenter} />
//         </div>
//       </div>

//       {/* Saved Searches Sidebar */}
//       {showSavedSearches && (
//         <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
//           <SavedSearch
//             onApplySavedSearch={handleApplySavedSearch}
//             onSaveCurrentSearch={handleSaveCurrentSearch}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default PropertyMap;
