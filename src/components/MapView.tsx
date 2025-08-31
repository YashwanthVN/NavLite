import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  from: { lat: number; lon: number; name: string } | null;
  to: { lat: number; lon: number; name: string } | null;
}

const MapView: React.FC<MapViewProps> = ({ from, to }) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            // Add a circle marker for user location
            userMarkerRef.current = L.circleMarker([latitude, longitude], {
              radius: 8,
              fillColor: "#4285F4",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9,
            })
              .addTo(mapRef.current!)
              .bindPopup("📍 You are here");

            // Center map on user location
            mapRef.current!.setView([latitude, longitude], 13);
          },
          (err) => {
            console.error("Geolocation error:", err);
          }
        );
      }
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old route
    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }

    // Add "from" marker
    if (from) {
      L.marker([from.lat, from.lon]).addTo(mapRef.current).bindPopup(`From: ${from.name}`);
    }

    // Add "to" marker
    if (to) {
      L.marker([to.lat, to.lon]).addTo(mapRef.current).bindPopup(`To: ${to.name}`);
    }

    // If both available → fetch route
    if (from && to) {
      (async () => {
        try {
          const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
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
          });

          const data = await res.json();
          if (!data || !data.features) return;

          const coords = data.features[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
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
