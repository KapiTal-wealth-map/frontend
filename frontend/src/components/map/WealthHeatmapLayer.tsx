import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Define the interface for heatmap data points
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface WealthHeatmapLayerProps {
  points: HeatmapPoint[];
  visible: boolean;
  radius?: number;
  blur?: number;
  maxZoom?: number;
  gradient?: Record<string, string>;
}

// This component doesn't render any visible elements directly
// It works by manipulating the Leaflet map instance
const WealthHeatmapLayer: React.FC<WealthHeatmapLayerProps> = ({
  points,
  visible,
  radius = 35,
  blur = 20,
  maxZoom = 18,
  gradient = {
    0.2: '#1a237e', // Deep blue for low values
    0.4: '#0d47a1',
    0.6: '#01579b',
    0.7: '#0277bd',
    0.8: '#039be5',
    0.9: '#29b6f6',
    1.0: '#4fc3f7'  // Light blue for high values
  }
}) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  // Convert points to the format expected by Leaflet.heat
  const heatData = points.map(point => [point.lat, point.lng, point.intensity]);

  useEffect(() => {
    // Clean up function to remove the heat layer when component unmounts
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    if (visible) {
      // If the layer doesn't exist yet, create it
      if (!heatLayerRef.current) {
        // @ts-ignore - Leaflet heat is not typed
        heatLayerRef.current = L.heatLayer(heatData, {
          radius,
          blur,
          maxZoom,
          gradient
        }).addTo(map);
      } else {
        // If it exists but data has changed, update it
        heatLayerRef.current.setLatLngs(heatData);
      }
    } else if (heatLayerRef.current) {
      // If not visible but layer exists, remove it
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
  }, [map, visible, heatData, radius, blur, maxZoom, gradient]);

  // This component doesn't render anything directly
  return null;
};

export default WealthHeatmapLayer;
