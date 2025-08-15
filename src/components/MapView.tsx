// src/components/MapView.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const MapView: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Initialize the map only once
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([12.9716, 77.5946], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      L.marker([12.9716, 77.5946])
        .addTo(mapRef.current)
        .bindPopup('Hello from Bangalore!');
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        if (mapRef.current) {
          mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 14);
          L.marker([parseFloat(lat), parseFloat(lon)])
            .addTo(mapRef.current)
            .bindPopup(display_name)
            .openPopup();
        }
      } else {
        alert('No results found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching location');
    }
  };

  return (
    <>
      {/* Search box */}
      <form
        onSubmit={handleSearch}
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#fff',
          padding: '5px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        <input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '5px', minWidth: '200px' }}
        />
        <button type="submit" style={{ padding: '5px 10px', marginLeft: '5px' }}>
          Search
        </button>
      </form>

      {/* Map container */}
      <div id="map" style={{ height: '100vh', width: '100%' }}></div>
    </>
  );
};

export default MapView;
