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
  radius = 25,
  blur = 15,
  maxZoom = 17,
  gradient = { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
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
