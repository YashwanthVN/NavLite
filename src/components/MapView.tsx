// src/components/MapView.tsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "./SearchBar";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  routeCoords: [number, number][];
  marker: [number, number] | null;
  onSelect: (
    lat: number,
    lon: number,
    name: string,
    bbox?: [number, number, number, number]
  ) => void;
}

const MapView: React.FC<MapViewProps> = ({ routeCoords, marker, onSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  const indiaCenter: [number, number] = [20.5937, 78.9629];

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(indiaCenter, 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle marker update
  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (marker) {
      markerRef.current = L.marker(marker)
        .addTo(mapRef.current)
        .bindPopup("Selected location")
        .openPopup();
      mapRef.current.setView(marker, 13);
    }
  }, [marker]);

  // Handle route update
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    if (routeCoords.length > 1) {
      routeRef.current = L.polyline(routeCoords, { color: "blue" }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeRef.current.getBounds(), { padding: [20, 20] });
    }
  }, [routeCoords]);

  return (
    <>
      <SearchBar onSelect={onSelect} />
      <div id="map" style={{ height: "100vh", width: "100%" , zIndex: 1}} />
    </>
  );
};

export default MapView;
