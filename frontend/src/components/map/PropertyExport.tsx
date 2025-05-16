import React, { useState } from 'react';
import type { Property } from './PropertyMarker';

// Export format options
export type ExportFormat = 'pdf' | 'csv' | 'excel';

interface PropertyExportModalProps {
  property: Property;
  onClose: () => void;
  onExport: (property: Property, format: ExportFormat) => void;
}

export const PropertyExportModal: React.FC<PropertyExportModalProps> = ({
  property,
  onClose,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate an export with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onExport(property, selectedFormat);
      onClose();
    } catch (error) {
      console.error('Error exporting property:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Export Property Data</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2 text-gray-700">{property.address}</h3>
          <p className="text-sm text-gray-500">Select your preferred export format</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center">
            <input
              type="radio"
              id="format-pdf"
              name="export-format"
              value="pdf"
              checked={selectedFormat === 'pdf'}
              onChange={() => setSelectedFormat('pdf')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="format-pdf" className="ml-2 text-gray-700">
              PDF Document (.pdf)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="format-csv"
              name="export-format"
              value="csv"
              checked={selectedFormat === 'csv'}
              onChange={() => setSelectedFormat('csv')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="format-csv" className="ml-2 text-gray-700">
              CSV File (.csv)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="format-excel"
              name="export-format"
              value="excel"
              checked={selectedFormat === 'excel'}
              onChange={() => setSelectedFormat('excel')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="format-excel" className="ml-2 text-gray-700">
              Excel Spreadsheet (.xlsx)
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              `Export as ${selectedFormat.toUpperCase()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock function to simulate export functionality
export const exportProperty = async (property: Property, format: ExportFormat): Promise<string> => {
  // In a real implementation, this would call the backend API
  // For now, we'll return a mock URL
  console.log(`Exporting property ${property.id} as ${format}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock download URL
  return `https://api.example.com/property/${property.id}/export?format=${format}&t=${Date.now()}`;
};

// Utility hook for property exports
export const usePropertyExport = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [propertyToExport, setPropertyToExport] = useState<Property | null>(null);
  
  const openExportModal = (property: Property) => {
    setPropertyToExport(property);
    setIsExportModalOpen(true);
  };
  
  const closeExportModal = () => {
    setIsExportModalOpen(false);
    setPropertyToExport(null);
  };
  
  const handleExport = async (property: Property, format: ExportFormat) => {
    try {
      const downloadUrl = await exportProperty(property, format);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.download = `property-${property.id}-${format}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error exporting property:', error);
      return false;
    }
  };
  
  return {
    isExportModalOpen,
    propertyToExport,
    openExportModal,
    closeExportModal,
    handleExport
  };
};
