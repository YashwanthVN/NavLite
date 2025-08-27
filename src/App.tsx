import React, { useState } from "react";
import MapView from "./components/MapView";

const App: React.FC = () => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(null);

  const handleSelect = (
    lat: number,
    lon: number,
    name: string,
    bbox?: [number, number, number, number]
  ) => {
    console.log("Selected location:", name, lat, lon, bbox);

    setMarker([lat, lon]);
    setRoute([
      [12.9716, 77.5946], // Bangalore
      [lat, lon],
    ]);
  };

  return (
    <MapView routeCoords={route} marker={marker} onSelect={handleSelect} />
  );
};

export default App;
