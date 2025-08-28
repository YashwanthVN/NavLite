import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  from: { lat: number; lon: number; name: string } | null;
  to: { lat: number; lon: number; name: string } | null;
}

const MapView: React.FC<MapViewProps> = ({ from, to }) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const fromMarkerRef = useRef<L.Marker | null>(null);
  const toMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.5937, 78.9629], 5);

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

  // Update markers & route whenever from/to change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old route
    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    // Remove old markers
    if (fromMarkerRef.current) {
      mapRef.current.removeLayer(fromMarkerRef.current);
      fromMarkerRef.current = null;
    }
    if (toMarkerRef.current) {
      mapRef.current.removeLayer(toMarkerRef.current);
      toMarkerRef.current = null;
    }

    // Add "from" marker
    if (from) {
      fromMarkerRef.current = L.marker([from.lat, from.lon])
        .addTo(mapRef.current)
        .bindPopup(`From: ${from.name}`)
        .openPopup();
    }

    // Add "to" marker
    if (to) {
      toMarkerRef.current = L.marker([to.lat, to.lon])
        .addTo(mapRef.current)
        .bindPopup(`To: ${to.name}`);
    }

    // If both available → fetch route
    if (from && to) {
      (async () => {
        try {
          const res = await fetch(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: import.meta.env.VITE_ORS_API_KEY,
              },
              body: JSON.stringify({
                coordinates: [
                  [from.lon, from.lat],
                  [to.lon, to.lat],
                ],
              }),
            }
          );

          const data = await res.json();
          if (!data || !data.features) return;

          const coords = data.features[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]]
          );
          routeRef.current = L.polyline(coords, { color: "blue" }).addTo(mapRef.current!);
          mapRef.current!.fitBounds(routeRef.current.getBounds(), { padding: [20, 20] });
        } catch (err) {
          console.error("ORS API error:", err);
        }
      })();
    }
  }, [from, to]);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default MapView;
