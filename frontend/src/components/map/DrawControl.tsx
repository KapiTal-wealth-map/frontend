import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
// @ts-ignore
import 'leaflet-draw'; // Ensure leaflet-draw is loaded
// Import leaflet-draw types for TypeScript
// @ts-ignore
import 'leaflet-draw/dist/leaflet.draw.js';

// Extend Leaflet types to include Control.Draw and Draw.Event
declare global {
  namespace L {
    namespace Control {
      class Draw extends L.Control {
        constructor(options?: any);
      }
    }
    namespace Draw {
      const Event: {
        CREATED: string;
        EDITED: string;
        DELETED: string;
        DRAWSTART: string;
        DRAWSTOP: string;
        DRAWVERTEX: string;
        EDITSTART: string;
        EDITMOVE: string;
        EDITRESIZE: string;
        EDITVERTEX: string;
        EDITSTOP: string;
        DELETESTART: string;
        DELETESTOP: string;
      };
    }
  }
}

// Helper to detect freehand drawing
const useFreehandDraw = (map: L.Map | null, onDrawCreated: (polygon: L.Polygon) => void) => {
  const layerRef = useRef<L.Polygon | null>(null);
  const pointsRef = useRef<L.LatLng[]>([]);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    const onMouseDown = (e: MouseEvent) => {
      drawingRef.current = true;
      const latlng = map.containerPointToLatLng(L.point(e.offsetX, e.offsetY));
      pointsRef.current = [latlng];
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawingRef.current) return;
      const latlng = map.containerPointToLatLng(L.point(e.offsetX, e.offsetY));
      pointsRef.current.push(latlng);
      if (layerRef.current) {
        layerRef.current.setLatLngs(pointsRef.current);
      } else {
        layerRef.current = L.polygon(pointsRef.current, { color: 'purple' }).addTo(map);
      }
    };

    const onMouseUp = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;

      if (layerRef.current) {
        // Close the polygon
        const latlngs = pointsRef.current;
        layerRef.current.setLatLngs([...latlngs, latlngs[0]]);
        onDrawCreated(layerRef.current);
      }
      pointsRef.current = [];
    };

    map.getContainer().addEventListener('mousedown', onMouseDown);
    map.getContainer().addEventListener('mousemove', onMouseMove);
    map.getContainer().addEventListener('mouseup', onMouseUp);
    map.getContainer().addEventListener('mouseleave', onMouseUp);

    return () => {
      map.getContainer().removeEventListener('mousedown', onMouseDown);
      map.getContainer().removeEventListener('mousemove', onMouseMove);
      map.getContainer().removeEventListener('mouseup', onMouseUp);
      map.getContainer().removeEventListener('mouseleave', onMouseUp);
    };
  }, [map, onDrawCreated]);
};

interface DrawControlProps {
  drawMode: 'off' | 'rectangle' | 'circle' | 'polygon' | 'lasso';
  onDrawCreated: (layer: L.Layer) => void;
}

const DrawControl: React.FC<DrawControlProps> = ({ drawMode, onDrawCreated }) => {
  const map = useMap();
  // leaflet-draw does not have TypeScript types for L.Control.Draw by default
  const drawControlRef = useRef<any>(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useFreehandDraw(map, (polygon) => {
    if (drawMode === 'lasso') {
      // Clear existing drawn shapes
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(polygon);
      onDrawCreated(polygon);
    }
  });

  useEffect(() => {
    if (!map) return;

    // Add feature group if not already added
    if (!map.hasLayer(drawnItemsRef.current)) {
      map.addLayer(drawnItemsRef.current);
    }

    // Remove previous draw control if any
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (drawMode === 'off' || drawMode === 'lasso') {
      // No leaflet-draw control for freehand or off mode
      return;
    }

    // Setup draw options for leaflet-draw based on drawMode
    const drawOptions = {
      draw: {
        polygon: drawMode === 'polygon',
        rectangle: drawMode === 'rectangle',
        circle: drawMode === 'circle',
        polyline: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
      },
    };

    const drawControl = new L.Control.Draw(drawOptions);
    drawControlRef.current = drawControl;
    map.addControl(drawControl);

    const onDrawCreatedHandler = (e: any) => {
      const layer = e.layer;
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      onDrawCreated(layer);
    };

    map.on(L.Draw.Event.CREATED, onDrawCreatedHandler);

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreatedHandler);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      drawnItemsRef.current.clearLayers();
    };
  }, [map, drawMode, onDrawCreated]);

  return null;
};

export default DrawControl;
