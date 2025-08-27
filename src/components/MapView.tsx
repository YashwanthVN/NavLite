// src/components/MapView.tsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "./SearchBar";

// Fix Leaflet default marker icons
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const MapView: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [markerName, setMarkerName] = useState<string>("");

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([12.9716, 77.5946], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Default marker (Bangalore)
      L.marker([12.9716, 77.5946])
        .addTo(mapRef.current)
        .bindPopup("Hello from Bangalore!");
    }

    // Cleanup map instance properly
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Draw or replace route
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old route if exists
    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    // Add new route
    if (routeCoords.length > 0) {
      const polyline = L.polyline(routeCoords, { color: "blue" }).addTo(mapRef.current);
      routeRef.current = polyline;

      // Auto-fit to show route
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [20, 20] });
    }
  }, [routeCoords]);

  // Drop or replace marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (marker) {
  markerRef.current = L.marker(marker)
    .addTo(mapRef.current)
    .bindPopup(markerName || "Searched location") // ✅ use name here
    .openPopup();
  mapRef.current.setView(marker, Math.max(mapRef.current.getZoom(), 14));
}
  }, [marker, markerName]);

  // Search callback (called from SearchBar)
  const handleSearch = (lat: number, lon: number, name?: string) => {
  setMarker([lat, lon]);
  setRouteCoords([
    [12.9716, 77.5946], // Bangalore
    [lat, lon],
  ]);

  setMarkerName(name || "");
};


  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <div id="map" style={{ height: "100vh", width: "100%" }} />
    </>
  );
};

export default MapView;
