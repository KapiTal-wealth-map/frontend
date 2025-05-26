import React, {useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { Property } from '../../services/api';

interface ClusterLayerProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  visible: boolean;
}

const ClusterLayer: React.FC<ClusterLayerProps> = ({ properties, onSelectProperty, visible }) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Create or update the cluster group when properties change
  useEffect(() => {
    if (!map || !visible) return;
    
    // Remove existing cluster group if it exists
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    
    // Create a new cluster group
    const newClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="bg-blue-600 rounded-full flex items-center justify-center text-white font-bold" style="width: ${30 + Math.min(count, 20)}px; height: ${30 + Math.min(count, 20)}px;">${count}</div>`,
          className: 'custom-marker-cluster',
          iconSize: L.point(40, 40),
        });
      }
    });
    
    // Add markers to the cluster group
    properties.forEach(property => {
      const marker = L.marker([property.latitude, property.longitude], {
        icon: L.divIcon({
          html: `<div class="bg-red-500 rounded-full flex items-center justify-center text-white p-2">$</div>`,
          className: 'custom-marker',
          iconSize: L.point(30, 30),
        })
      });
      
      marker.on('click', () => {
        onSelectProperty(property);
      });
      
      newClusterGroup.addLayer(marker);
    });
    
    // Add the cluster group to the map
    map.addLayer(newClusterGroup);
    clusterGroupRef.current = newClusterGroup;
    
    // Cleanup function to remove the cluster group when the component unmounts
    return () => {
      if (clusterGroupRef.current && map) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, properties, onSelectProperty, visible]);

  // This component doesn't render any React elements directly
  // It works by manipulating the map using Leaflet's API
  return null;
};

export default ClusterLayer;
