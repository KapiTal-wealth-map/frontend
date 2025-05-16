import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const { BaseLayer } = LayersControl;

interface Property {
  id: string;
  address: string;
  value: number;
  size: number;
  owner: string;
}

interface GeoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Property;
}

interface Filters {
  minValue: number;
  maxValue: number;
}

interface FetchClustersProps {
  filters: Filters;
  setMarkers: React.Dispatch<React.SetStateAction<GeoFeature[]>>;
}

const FetchClusters: React.FC<FetchClustersProps> = ({ filters, setMarkers }) => {
  const map = useMap();

  useEffect(() => {
    const fetchData = async () => {
      const bounds = map.getBounds();
      const bbox = [
        bounds.getSouthWest().lng,
        bounds.getSouthWest().lat,
        bounds.getNorthEast().lng,
        bounds.getNorthEast().lat
      ];

      try {
        const res = await axios.get("/api/properties", {
          params: {
            bbox: bbox.join(","),
            minValue: filters.minValue,
            maxValue: filters.maxValue
          }
        });
        setMarkers(res.data.features);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    map.on("moveend", fetchData);
    fetchData();

    return () => {
      map.off("moveend", fetchData);
    };
  }, [filters, map, setMarkers]);

  return null;
};

const InteractiveMap: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    minValue: 0,
    maxValue: 9999999
  });
  const [markers, setMarkers] = useState<GeoFeature[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  const handleSaveView = () => {
    const map = mapRef.current;
    if (map) {
      const center = map.getCenter();
      const view = {
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
        filters
      };
      localStorage.setItem("savedMapView", JSON.stringify(view));
      alert("Map view saved!");
    }
  };

  const loadSavedView = () => {
    const saved = localStorage.getItem("savedMapView");
    if (saved && mapRef.current) {
      const view = JSON.parse(saved);
      mapRef.current.setView(view.center, view.zoom);
      setFilters(view.filters);
    }
  };

  return (
    <>
      <div className="map-controls" style={{ padding: "1rem", backgroundColor: "#fff" }}>
        <label>
          Min Value:
          <input
            type="number"
            value={filters.minValue}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minValue: Number(e.target.value) }))
            }
          />
        </label>
        <label>
          Max Value:
          <input
            type="number"
            value={filters.maxValue}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, maxValue: Number(e.target.value) }))
            }
          />
        </label>
        <button onClick={handleSaveView}>Save View</button>
        <button onClick={loadSavedView}>Load View</button>
      </div>

      <MapContainer
        center={[39.8283, -98.5795]} // Center of the US
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "100vh", width: "100%" }}
        ref={mapRef}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Standard">
            <TileLayer
              attribution='© OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              attribution="© HERE Maps"
              url={`https://{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=YOUR_HERE_APP_ID&app_code=YOUR_HERE_APP_CODE`}
            />
          </BaseLayer>
        </LayersControl>

        <FetchClusters filters={filters} setMarkers={setMarkers} />

        {markers.map((marker) => (
          <Marker
            key={marker.properties.id}
            position={[
              marker.geometry.coordinates[1],
              marker.geometry.coordinates[0]
            ]}
            icon={L.icon({
              iconUrl: "/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>
              <b>{marker.properties.address}</b>
              <br />
              Value: ${marker.properties.value.toLocaleString()}
              <br />
              Owner: {marker.properties.owner}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default InteractiveMap;
