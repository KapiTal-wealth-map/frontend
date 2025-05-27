import React, { useState, useEffect, useRef } from 'react';
import { propertyAPI, favoriteAPI } from '../services/api';
import type { Property } from '../services/api';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components
Chart.register(...registerables, ChartDataLabels, zoomPlugin);
const ITEMS_PER_PAGE = 10;

const PropertyListings: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Property>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    county: '',
    region: '',
    beds: '',
    baths: '',
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState<{
    properties: any[];
    metrics: {
      totalProperties: number;
      avgPrice: number;
      avgBeds: number;
      avgBaths: number;
      avgSqft: number;
      propertiesByCounty: Record<string, number>;
    };
    generatedAt: string;
  } | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    fetchProperties();
    fetchFavorites();
  }, [currentPage]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Fetch all properties at once
      const response = await propertyAPI.getAllProperties(1, 1000); // Adjust the page size as needed
      const allProps = response?.data || [];
      setAllProperties(allProps);
      applyFiltersAndPagination(allProps, filters, currentPage);
      setTotalItems(response?.total || 0);
    } catch (err) {
      setError('Failed to fetch properties. Please try again later.');
      console.error('Error fetching properties:', err);
      setAllProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };


  // Helper function to add price trends chart with mean values and better visualization
  const addPriceTrendsChart = async (doc: any, properties: any[], x: number, y: number, width: number, height: number) => {
    console.log('Starting market trends chart generation...');
    try {
      const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
      
      if (!properties || properties.length === 0) {
        console.warn('No properties available for trends chart');
        doc.text('No property data available for trends', x, y);
        return y + 20;
      }

      // Extract all ZHVI and Market Value data points
      const allZhviData: number[][] = [];
      const allMarketValueData: number[][] = [];
      
      properties.forEach(property => {
        // Try different possible property names (case insensitive)
        const zhviData = property.ZHVI || property.zhvi || property.zhviData || [];
        const marketValueData = property.Market_Value || property.market_value || property.marketValue || [];
        
        if (zhviData.length > 0) allZhviData.push(zhviData);
        if (marketValueData.length > 0) allMarketValueData.push(marketValueData);
      });
      
      console.log(`Found ${allZhviData.length} properties with ZHVI data`);
      console.log(`Found ${allMarketValueData.length} properties with Market Value data`);
      
      // Calculate mean values
      const calculateMean = (data: number[][]) => {
        if (data.length === 0) return [];
        return data[0].map((_, i) => {
          const sum = data.reduce((acc, curr) => acc + (curr[i] || 0), 0);
          return Math.round(sum / data.length);
        });
      };
      
      const meanZhvi = calculateMean(allZhviData);
      const meanMarketValue = calculateMean(allMarketValueData);
      
      console.log('Mean ZHVI:', meanZhvi);
      console.log('Mean Market Value:', meanMarketValue);
      
      // Create datasets for the chart
      const datasets = [];
      
      // Add mean ZHVI line
      if (meanZhvi.length > 0) {
        datasets.push({
          label: 'Mean ZHVI',
          data: meanZhvi,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
          pointHoverBackgroundColor: '#4e73df'
        });
      }
      
      // Add mean Market Value line
      if (meanMarketValue.length > 0) {
        datasets.push({
          label: 'Mean Market Value',
          data: meanMarketValue,
          borderColor: '#1cc88a',
          backgroundColor: 'rgba(28, 200, 138, 0.05)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
          pointHoverBackgroundColor: '#1cc88a'
        });
      }
      
      // If no data is available, show a message
      if (datasets.length === 0) {
        console.warn('No trend data available for chart');
        doc.text('No trend data available', x, y);
        return y + 20;
      }
      
      // Determine the number of years to display
      const maxDataPoints = Math.max(
        ...datasets.map(ds => ds.data.length),
        years.length
      );
      
      const chartData = {
        labels: years.slice(0, maxDataPoints),
        datasets: datasets
      };
      
      const chartConfig = {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Market Trends Analysis (2018-2025)',
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: { bottom: 20 }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 },
              padding: 12,
              callbacks: {
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  const value = context.raw !== null ? `$${context.raw.toLocaleString()}` : 'N/A';
                  return `${label}: ${value}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: {
                font: { size: 12 },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: 'Value ($)',
                font: { weight: 'bold' }
              },
              ticks: {
                callback: (value: any) => `$${value.toLocaleString()}`,
                maxRotation: 0,
                padding: 10
              }
            },
            x: {
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'Year',
                font: { weight: 'bold' }
              },
              ticks: {
                padding: 10
              }
            }
          },
          elements: {
            line: {
              borderWidth: 2
            },
            point: {
              hoverRadius: 8,
              hoverBorderWidth: 2
            }
          },
          layout: {
            padding: {
              top: 10,
              right: 20,
              bottom: 10,
              left: 20
            }
          },
          animation: {
            duration: 0 // Disable animations for PDF export
          }
        }
      };
      
      console.log('Adding trends chart to PDF...');
      const newY = await addChartToPdf(doc, chartConfig, x, y, width, height);
      console.log('Successfully added trends chart');
      return newY;
  } catch (error) {
    console.error('Error in addPriceTrendsChart:', error);
    doc.text('Error generating trends chart', x, y);
    return y + 20;
  }
}

// Helper function to add property comparison chart
const addPropertyComparisonChart = async (doc: any, properties: any[], x: number, y: number, width: number, height: number) => {
  // Get top 5 most expensive properties for comparison
  const sortedProperties = [...properties]
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 5);
  
  const chartData = {
    labels: sortedProperties.map(p => p.address.substring(0, 20) + '...'),
    datasets: [{
      label: 'Price',
      data: sortedProperties.map(p => p.price),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };
  
  const chartConfig = {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top 5 Most Expensive Properties'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `$${context.parsed.y.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Price ($)'
          },
          ticks: {
            callback: (value: any) => `$${value.toLocaleString()}`
          }
        }
      }
    }
  };
  
  return addChartToPdf(doc, chartConfig, x, y, width, height);
};

  const applyFiltersAndPagination = (properties: Property[], currentFilters: typeof filters, page: number) => {
    // Apply filters
    const filtered = properties.filter((property: Property) => {
      if (!property) return false;
      const hasActiveFilters = Object.values(currentFilters).some(value => value !== '');
      
      if (!hasActiveFilters) return true; // Show all properties if no filters are active
      
      return (
        (!currentFilters.minPrice || property.price >= Number(currentFilters.minPrice)) &&
        (!currentFilters.maxPrice || property.price <= Number(currentFilters.maxPrice)) &&
        (!currentFilters.county || property.county.toLowerCase().includes(currentFilters.county.toLowerCase())) &&
        (!currentFilters.region || property.regionName.toLowerCase().includes(currentFilters.region.toLowerCase())) &&
        (!currentFilters.beds || property.beds >= Number(currentFilters.beds)) &&
        (!currentFilters.baths || property.baths >= Number(currentFilters.baths))
      );
    });

    // Apply sorting
    const sorted = [...filtered].sort((a: Property, b: Property) => {
      if (!a || !b) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

    setFilteredProperties(sorted);
    setTotalItems(sorted.length);
    setProperties(sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE));
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      if (response.status === 200) {
        const favoriteIds = response.data.map((prop: { propertyId: string; }) => prop.propertyId);
        setFavorites(favoriteIds);
      } else {
        console.error('Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFavorited = (id: string) => {
    if (favorites.length === 0) return false;
    return favorites.includes(id);
  }

  const handleToggleFavorite = async (property: Property) => {
    const isSaved = isFavorited(property.id);
    if (isSaved) {
      const response = await favoriteAPI.removeFavorite([property.id]);
      if (response.status == 200) {
        alert(`Successfully removed ${property.address} from favorites!`);
      }
      else {
        alert(`Failed to remove ${property.address} from favorites!`);
      }
    }
    else {
      const response = await favoriteAPI.addFavorite([property.id]);
      if (response.status == 201) {
        alert(`Successfully added ${property.address} to favorites!`);
      }
      else {
        alert(`Failed to add ${property.address} to favorites!`);
      }
    }
    setFavorites((prev) =>
      isSaved ? prev.filter(id => id !== property.id) : [...prev, property.id]
    );
  };
  const handleBulkFavorite = async (ids: string[]) => {
    if (ids.length === 0) return;
    const response = await favoriteAPI.addFavorite(ids);
    if (response.status === 201) {
      setFavorites(prev => [...new Set([...prev, ...ids])]);
      alert('Favorites added successfully!');
    } else {
      console.error('Failed to add favorites');
    }
  };

  const handleBulkUnfavorite = async (ids: string[]) => {
    if (ids.length === 0) return;
    const response = await favoriteAPI.removeFavorite(ids);
    if (response.status === 200) {
      setFavorites(prev => prev.filter(id => !ids.includes(id)));
      alert('Favorites removed successfully!');
    } else {
      console.error('Failed to remove favorites');
    }
    setFavorites(prev => prev.filter(id => !ids.includes(id)));
  };

  // Generate report for selected properties
  const generateReport = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one property to generate a report');
      return;
    }

    setLoadingReport(true);
    try {
      // Get selected properties
      const selectedProperties = allProperties.filter(p => selectedIds.includes(p.id));
      
      // Calculate basic metrics
      const totalProperties = selectedProperties.length;
      const avgPrice = selectedProperties.reduce((sum, p) => sum + (p.price || 0), 0) / totalProperties;
      const avgBeds = selectedProperties.reduce((sum, p) => sum + (p.beds || 0), 0) / totalProperties;
      const avgBaths = selectedProperties.reduce((sum, p) => sum + (p.baths || 0), 0) / totalProperties;
      const avgSqft = selectedProperties.reduce((sum, p) => sum + (p.livingSpace || 0), 0) / totalProperties;

      // Group by county
      const propertiesByCounty = selectedProperties.reduce((acc: Record<string, number>, property) => {
        const county = property.county || 'Unknown';
        acc[county] = (acc[county] || 0) + 1;
        return acc;
      }, {});

      setReportData({
        properties: selectedProperties,
        metrics: {
          totalProperties,
          avgPrice,
          avgBeds,
          avgBaths,
          avgSqft,
          propertiesByCounty,
        },
        generatedAt: new Date().toLocaleString(),
      });
      setShowReportModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoadingReport(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!reportData) return;
    
    const headers = ['Address', 'Price', 'Beds', 'Baths', 'Sq Ft', 'County', 'Region'];
    const csvContent = [
      headers.join(','),
      ...reportData.properties.map((p: any) => [
        `"${p.address || ''}"`,
        p.price || '',
        p.beds || '',
        p.baths || '',
        p.livingSpace || '',
        `"${p.county || ''}"`,
        `"${p.regionName || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `property-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      console.log('Starting PDF generation...');
      
      if (!reportData || !reportData.properties || reportData.properties.length === 0) {
        alert('No report data available');
        return;
      }
    
      // Create a new PDF document
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - 2 * margin;
      
      console.log('Adding title...');
      // Title and metadata
      doc.setFontSize(20);
      doc.text('Property Analysis Report', margin, 40);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 60);
      
      // Summary Section
      doc.setFontSize(16);
      doc.text('1. Executive Summary', margin, 100);
      doc.setFontSize(10);
      
      // Basic metrics
      console.log('Calculating metrics...');
      const metrics = calculateMetrics(reportData.properties);
      let yPos = 130;
      
      const summaryText = [
        `Total Properties: ${metrics.totalProperties}`,
        `Average Price: $${metrics.avgPrice.toLocaleString()}`,
        `Average Beds: ${metrics.avgBeds.toFixed(1)}`,
        `Average Baths: ${metrics.avgBaths.toFixed(1)}`,
        `Average Living Space: ${metrics.avgSqft.toLocaleString()} sq ft`,
        `Price per Sq Ft: $${metrics.avgPricePerSqft.toFixed(2)}`
      ];
      
      summaryText.forEach((text, i) => {
        doc.text(text, margin, yPos + (i * 15));
      });
      
      // Add a simple bar chart for price distribution
      console.log('Adding price distribution chart...');
      yPos += 100;
      await addPriceDistributionChart(doc, reportData.properties, margin, yPos, contentWidth, 200);
      
      // Add a page for the detailed analysis
      console.log('Adding market analysis...');
      doc.addPage();
      yPos = 40;
      
      // Detailed Analysis Section
      doc.setFontSize(16);
      doc.text('2. Market Analysis', margin, yPos);
      yPos += 30;
      
      // Price trends over time
      doc.setFontSize(14);
      doc.text('Price Trends', margin, yPos);
      yPos += 20;
      
      // Add a trend analysis chart
      await addPriceTrendsChart(doc, reportData.properties, margin, yPos, contentWidth, 200);
      
      // Add another page for property comparison
      console.log('Adding property comparison...');
      doc.addPage();
      yPos = 40;
      
      // Property Comparison
      doc.setFontSize(16);
      doc.text('3. Property Comparison', margin, yPos);
      yPos += 30;
      
      // Add a comparison chart
      await addPropertyComparisonChart(doc, reportData.properties, margin, yPos, contentWidth, 200);
      
      // Save the PDF
      console.log('Saving PDF...');
      doc.save(`property-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };
  
  // Helper function to calculate metrics
  const calculateMetrics = (properties: any[]) => {
    const totalProperties = properties.length;
    const avgPrice = properties.reduce((sum, p) => sum + (p.price || 0), 0) / totalProperties;
    const avgBeds = properties.reduce((sum, p) => sum + (p.beds || 0), 0) / totalProperties;
    const avgBaths = properties.reduce((sum, p) => sum + (p.baths || 0), 0) / totalProperties;
    const avgSqft = properties.reduce((sum, p) => sum + (p.livingSpace || 0), 0) / totalProperties;
    const avgPricePerSqft = avgPrice / (avgSqft || 1);
    
    return {
      totalProperties,
      avgPrice,
      avgBeds,
      avgBaths,
      avgSqft,
      avgPricePerSqft
    };
  };
  
  // Helper function to calculate optimal price ranges using the Freedman-Diaconis rule
  const calculateOptimalBins = (prices: number[]): {min: number, max: number, bins: number} => {
    if (prices.length === 0) return { min: 0, max: 0, bins: 0 };
    
    // Sort prices for calculations
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const minPrice = Math.floor(sortedPrices[0] / 10000) * 10000; // Round down to nearest 10k
    const maxPrice = Math.ceil(sortedPrices[sortedPrices.length - 1] / 10000) * 10000; // Round up to nearest 10k
    
    // Use Freedman-Diaconis rule to determine optimal number of bins
    const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
    const iqr = q3 - q1;
    const binWidth = (2 * iqr) / Math.cbrt(prices.length);
    const bins = binWidth > 0 ? Math.ceil((maxPrice - minPrice) / binWidth) : 10;
    
    // Ensure we have a reasonable number of bins
    const optimalBins = Math.min(Math.max(5, bins), 15);
    
    return { min: minPrice, max: maxPrice, bins: optimalBins };
  };

  // Helper function to generate price distribution data
  const generatePriceDistribution = (prices: number[], min: number, max: number, bins: number) => {
    const range = max - min;
    const binSize = range / bins;
    const data = new Array(bins).fill(0);
    const labels = [];
    
    // Create labels for each bin
    for (let i = 0; i < bins; i++) {
      const binStart = Math.round(min + (i * binSize));
      const binEnd = Math.round(min + ((i + 1) * binSize));
      labels.push(`$${binStart.toLocaleString()}-${binEnd.toLocaleString()}`);
    }
    
    // Count properties in each bin
    prices.forEach(price => {
      if (price < min || price > max) return;
      const binIndex = Math.min(Math.floor((price - min) / binSize), bins - 1);
      data[binIndex]++;
    });
    
    return { labels, data };
  };

  // Helper function to add price distribution chart with dynamic ranges
  const addPriceDistributionChart = async (doc: any, properties: any[], x: number, y: number, width: number, height: number) => {
    console.log('Starting price distribution chart generation...');
    try {
      // Extract and validate prices
      const prices = properties
        .map(p => p.price)
        .filter((p): p is number => p !== undefined && p !== null && !isNaN(p) && p > 0);
      
      console.log(`Found ${prices.length} valid prices out of ${properties.length} properties`);
      
      if (prices.length === 0) {
        console.warn('No valid prices found for chart');
        doc.text('No price data available for chart', x, y);
        return y + 20;
      }
      
      // Calculate optimal bins and ranges
      const { min, max, bins } = calculateOptimalBins(prices);
      const { labels, data } = generatePriceDistribution(prices, min, max, bins);
      
      console.log('Price distribution data:', { min, max, bins, data });
      
      // Calculate mean and standard deviation for normal distribution
      const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const stdDev = Math.sqrt(
        prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length
      );
      
      // Generate normal distribution curve data
      const normalData = labels.map((_, i) => {
        const binStart = min + (i * (max - min) / bins);
        const binEnd = min + ((i + 1) * (max - min) / bins);
        const binCenter = (binStart + binEnd) / 2;
        
        // Normal distribution formula
        const exponent = -0.5 * Math.pow((binCenter - mean) / stdDev, 2);
        const probability = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
        
        // Scale to match the height of the bars
        return Math.round(probability * prices.length * (max - min) / bins);
      });
      
      // Create chart data
      const chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Number of Properties',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            barPercentage: 0.9,
            categoryPercentage: 0.9,
            order: 2
          },
          {
            label: 'Normal Distribution',
            data: normalData,
            type: 'line',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 1
          }
        ]
      };
      
      const chartConfig = {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Disable animations for PDF export
          },
          plugins: {
            title: {
              display: true,
              text: 'Property Price Distribution',
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: { bottom: 10 }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: { size: 12, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 10,
              callbacks: {
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  const value = context.raw !== null ? context.raw : 0;
                  return `${label}: ${value} ${value === 1 ? 'property' : 'properties'}`;
                }
              }
            },
            legend: {
              position: 'top',
              labels: {
                font: { size: 12 },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              title: {
                display: true,
                text: 'Number of Properties',
                font: { weight: 'bold' }
              },
              ticks: {
                precision: 0,
                stepSize: 1
              }
            },
            x: {
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'Price Range',
                font: { weight: 'bold' }
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              right: 15,
              bottom: 30,
              left: 15
            }
          }
        }
      };
      
      console.log('Adding chart to PDF...');
      const newY = await addChartToPdf(doc, chartConfig, x, y, width, height);
      
      // Add statistics below the chart
      doc.setFontSize(10);
      doc.text(
        `Statistics: Mean: $${Math.round(mean).toLocaleString()} • ` +
        `Median: $${Math.round(prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)])} • ` +
        `Std Dev: $${Math.round(stdDev).toLocaleString()}`,
        x,
        y - 10
      );
      
      console.log('Successfully added price distribution chart');
      return newY;
    } catch (error) {
      console.error('Error in addPriceDistributionChart:', error);
      doc.text('Error generating price distribution chart', x, y);
      return y + 20;
    }
  };
  
  // Helper function to add a chart to the PDF
  const addChartToPdf = async (doc: any, chartConfig: any, x: number, y: number, width: number, height: number) => {
    return new Promise((resolve) => {
      // Create a hidden container for the chart
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      document.body.appendChild(container);
      
      // Create canvas inside the container
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Disable animations for PDF export
      const pdfChartConfig = {
        ...chartConfig,
        options: {
          ...chartConfig.options,
          animation: {
            duration: 0
          },
          // Disable responsive behavior for PDF
          responsive: false,
          maintainAspectRatio: false
        }
      };

      try {
        // @ts-ignore
        const chart = new Chart(canvas, pdfChartConfig);
        
        // Wait for the chart to be fully rendered
        const checkRendered = () => {
          try {
            // Force a reflow to ensure rendering is complete
            // @ts-ignore
            const _ = canvas.offsetHeight;
            
            // Convert canvas to image
            const imageData = canvas.toDataURL('image/png', 1.0);
            
            if (imageData === 'data:,') {
              throw new Error('Empty image data generated');
            }
            
            // Add image to PDF
            doc.addImage(
              imageData,
              'PNG',
              x,
              y,
              width,
              height
            );
            
            // Clean up
            chart.destroy();
            document.body.removeChild(container);
            
            resolve(y + height + 20);
          } catch (e) {
            // If not ready yet, check again
            setTimeout(checkRendered, 50);
          }
        };
        
        // Start checking if the chart is rendered
        setTimeout(checkRendered, 100);
        
        // Set a timeout in case something goes wrong
        setTimeout(() => {
          if (container.parentNode) {
            document.body.removeChild(container);
          }
          resolve(y + height + 20);
        }, 5000);
        
      } catch (error) {
        console.error('Error creating chart:', error);
        doc.text('Error generating chart', x, y);
        if (container.parentNode) {
          document.body.removeChild(container);
        }
        resolve(y + 20);
      }
    });
  };

  const handleSort = (field: keyof Property) => {
    const newSortDirection = field === sortField 
      ? sortDirection === 'asc' ? 'desc' : 'asc'
      : 'asc';
    
    setSortField(field);
    setSortDirection(newSortDirection);
    
    // Apply sorting to the current filtered properties
    const sorted = [...filteredProperties].sort((a, b) => {
      if (!a || !b) return 0;
      const aValue = a[field];
      const bValue = b[field];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return newSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return newSortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
    
    setFilteredProperties(sorted);
    setProperties(sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    applyFiltersAndPagination(allProperties, newFilters, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setProperties(filteredProperties.slice((newPage - 1) * ITEMS_PER_PAGE, newPage * ITEMS_PER_PAGE));
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with title and action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Property Listings</h1>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            to="/wealth-map"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            View on Map
          </Link>
          <Link
            to="/favourite-properties"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Favorites
          </Link>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkFavorite(selectedIds)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${
                  selectedIds.length === 0 
                    ? 'bg-blue-300 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={selectedIds.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Save ({selectedIds.length})
              </button>
              <button
                onClick={() => handleBulkUnfavorite(selectedIds)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${
                  selectedIds.length === 0 
                    ? 'bg-red-300 text-white cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                disabled={selectedIds.length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Remove ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search properties by address, county, or region..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search properties"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                  aria-label="Minimum price"
                />
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">County</label>
            <input
              type="text"
              id="county"
              name="county"
              value={filters.county}
              onChange={(e) => handleFilterChange(e)}
              placeholder="Any county"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">Bedrooms & Bathrooms</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  id="beds"
                  name="beds"
                  value={filters.beds}
                  onChange={(e) => handleFilterChange(e)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Beds (Any)</option>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}+</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  id="baths"
                  name="baths"
                  value={filters.baths}
                  title='Baths'
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Baths (Any)</option>
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}+</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loadingReport || selectedIds.length === 0}
              className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                loadingReport || selectedIds.length === 0
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loadingReport ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1V4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H3zm6-11a1 1 0 00-1 1v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {selectedIds.length > 0 ? `Generate Report (${selectedIds.length})` : 'Select properties to generate report'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === properties.length}
                    placeholder='1,2,3'
                    onChange={() => {
                      if (selectedIds.length === properties.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(properties.map(property => property.id));
                      }
                    }}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('address')}
                >
                  Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('livingSpace')}
                >
                  Size (sq ft)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('beds')}
                >
                  Beds
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('baths')}
                >
                  Baths
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('zhvi')}
                >
                  Estimated Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('medianHouseholdIncome')}
                >
                  Median Income
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View on Map
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Save to Favorites
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    placeholder='1,3'
                    checked={selectedIds.includes(property.id)}
                    onChange={() => toggleSelection(property.id)}
                  />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{property.address}</div>
                    <div className="text-sm text-gray-500">
                      {property.regionName} {property.zipCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.livingSpace.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.beds}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.baths}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.zhvi[property.zhvi.length - 1])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(property.medianHouseholdIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      to="/wealth-map"
                      state={{ center: { lat: property.latitude, lng: property.longitude } }}
                      className="text-green-600 hover:text-green-900"
                    >
                      View on Map
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleFavorite(property)}
                      className={`px-3 py-1 rounded ${isFavorited(property.id) ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    >
                      {isFavorited(property.id) ? 'Unsave' : 'Save'}
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
{totalPages > 1 && (
  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
    <div className="flex-1 flex justify-between sm:hidden">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </p>
      </div>
      <div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            {/* Left arrow SVG */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Scrollable container for page number buttons */}
          <div className="max-w-[300px] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            {/* Right arrow SVG */}
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
)}


      {/* Report Modal */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Property Report</h2>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close report"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow" ref={reportContentRef}>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Properties</p>
                    <p className="text-2xl font-bold">{reportData.metrics.totalProperties}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Price</p>
                    <p className="text-2xl font-bold">${reportData.metrics.avgPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Beds/Baths</p>
                    <p className="text-2xl font-bold">{reportData.metrics.avgBeds.toFixed(1)} / {reportData.metrics.avgBaths.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Avg. Sq Ft</p>
                    <p className="text-2xl font-bold">{reportData.metrics.avgSqft.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Properties by County</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(reportData.metrics.propertiesByCounty).map(([county, count]) => (
                      <div key={county} className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800 font-medium">{county}</p>
                        <p className="text-lg font-bold">{count} {count === 1 ? 'property' : 'properties'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Property Details</h3>
                  <p className="text-sm text-gray-500">{reportData.properties.length} properties</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds/Baths</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sq Ft</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.properties.map((property: any) => (
                        <tr key={property.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {property.price ? `$${property.price.toLocaleString()}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {property.beds || 'N/A'} / {property.baths || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {property.livingSpace ? property.livingSpace.toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {property.county || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-500">
                Generated on {reportData.generatedAt}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 01-1-1v-5.586l-1.293 1.293a1 1 0 11-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L4 10.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M9.707 3.293a1 1 0 010 1.414L7.414 7H17a1 1 0 110 2H7.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default PropertyListings;