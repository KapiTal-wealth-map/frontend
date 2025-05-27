import React, { useEffect, useState, useRef } from 'react';
import type { Property } from '../../services/api';
import { propertyAPI, favoriteAPI } from '../../services/api';
import image from '../../assets/house.png';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PropertyDetailProps {
  property: Property | null;
  onClose: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedProperty, setDetailedProperty] = useState<Property | null>(property);
  const [zhviData, setZhviData] = useState<{date: string; value: number}[]>([]);
  const chartRef = useRef(null);

  // Generate dates from 2018 to 2025 (one value per year)
  const generateDateRange = () => {
    const dates = [];
    for (let year = 2018; year <= 2025; year++) {
      dates.push(`${year}-01-01`); // Using January 1st of each year
    }
    return dates;
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!property) return;
      
      try {
        setLoading(true);
        setError(null);
        const details = await propertyAPI.getPropertyById(property.id);
        // Add dummy owner data if not present
        if (!details.owner) {
          details.owner = {
            id: 'dummy-owner-id',
            age: 45,
            email: "john@smith.com",
            phone: "123-456-7890",
            name: "John Smith",
            netWorth: 2500000,
            occupation: "Tech Executive",
            purchaseDate: "2022-06-15",
          };
        }
        setDetailedProperty(details);
        
        // Use the ZHVI data from the property
        if (details.zhvi && details.zhvi.length > 0) {
          const dates = generateDateRange();
          const zhviData = details.zhvi.map((value, index) => ({
            date: dates[index] || '',
            value: value
          }));
          setZhviData(zhviData);
        }
      } catch (err) {
        setError('Failed to load property details. Please try again.');
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [property]);

  if (!property) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) => {
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Chart data is now prepared above with explicit year range

  // Ensure we have exactly 8 data points (2018-2025)
  const years = Array.from({length: 8}, (_, i) => 2018 + i);
  const chartData = {
    labels: years.map(year => year.toString()),
    datasets: [
      {
        label: 'ZHVI Value',
        data: years.map((_, index) => zhviData[index]?.value || null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        // Hide points completely by default
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 15,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'nearest',
      axis: 'x',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          title: function (context) {
            return `Year: ${context[0].label}`;
          },
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
      datalabels: {
        display: false, // Hide point values on the chart
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          padding: 10,
          autoSkip: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'ZHVI Value ($)',
        },
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          callback: function (value) {
            return `$${Math.round(value / 1000)}K`; // Format as $XXXK to match the image
          },
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Property detail modal content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{property.address}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading property details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              {/* Top Section: Property Image */}
              <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                <img src={image} className="object-cover w-full h-full rounded-lg" alt="Property" />
              </div>

              {/* Middle Section: ZHVI Graph and Property Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ZHVI Graph */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800">ZHVI Trend (2018-2025)</h3>
                  <div className="mt-2 h-80 bg-white p-4 rounded-lg border border-gray-200">
                    {zhviData.length > 0 ? (
                      <Line 
                        ref={chartRef}
                        data={chartData} 
                        options={chartOptions} 
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Loading ZHVI data...
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Details</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium text-lg">{formatCurrency(property.price)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Size</p>
                          <p className="font-medium">{property.livingSpace.toLocaleString()} sq ft</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Bedrooms</p>
                          <p className="font-medium">{property.beds}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Bathrooms</p>
                          <p className="font-medium">{property.baths}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {detailedProperty?.owner && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner Information</h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-3">
                            {detailedProperty.owner.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{detailedProperty.owner.name}</p>
                            <p className="text-sm text-gray-500">{detailedProperty.owner.occupation}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <div>
                            <p className="text-sm text-gray-500">Estimated Net Worth</p>
                            <p className="font-semibold">{formatCurrency(detailedProperty.owner.netWorth)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Purchase Date</p>
                            <p className="font-semibold">{formatDate(detailedProperty.owner.purchaseDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Actions */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={async () => {
                      await favoriteAPI.addFavorite([property.id]);
                      alert('Property added to favorites!');
                    }}
                  >
                    Save Property
                  </button>
                  <button 
                    className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
