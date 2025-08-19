import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

export interface MapViewProps {
  routeCoords?: [number, number][];   // polyline coordinates [lat, lng]
  marker?: [number, number] | null;   // single marker [lat, lng]
}

const MapView: React.FC<MapViewProps> = ({ routeCoords, marker }) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // init map once
  useEffect(() => {
  if (!mapRef.current) {
    mapRef.current = L.map("map").setView([12.9716, 77.5946], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // default marker at Bangalore
    L.marker([12.9716, 77.5946])
      .addTo(mapRef.current)
      .bindPopup("Hello from Bangalore!");
  }

  // cleanup returns void
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, []);

  // draw/replace route
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (routeCoords && routeCoords.length > 0) {
      const poly = L.polyline(routeCoords, { color: "blue" }).addTo(mapRef.current);
      routeRef.current = poly;
      mapRef.current.fitBounds(poly.getBounds(), { padding: [20, 20] });
    }
  }, [routeCoords]);

  // drop/replace marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (marker) {
      markerRef.current = L.marker(marker).addTo(mapRef.current);
      mapRef.current.setView(marker, Math.max(mapRef.current.getZoom(), 14));
    }
  }, [marker]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default MapView;
