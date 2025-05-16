declare module '@changey/react-leaflet-markercluster' {
  import { FC, ReactNode } from 'react';
  import L from 'leaflet';
  import 'leaflet.markercluster';

  interface MarkerClusterGroupProps {
    children?: ReactNode;
    chunkedLoading?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number;
    polygonOptions?: L.PolylineOptions;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    iconCreateFunction?: (cluster: L.MarkerCluster) => L.Icon | L.DivIcon;
    spiderfyDistanceMultiplier?: number;
    clusterPane?: string;
  }

  const MarkerClusterGroup: FC<MarkerClusterGroupProps>;

  export default MarkerClusterGroup;
}
