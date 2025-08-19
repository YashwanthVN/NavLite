import React, { useState } from "react";
import MapView from "./components/MapView";
import SearchBox from "./components/SearchBar";

const App: React.FC = () => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(null);

  const handleSearch = (lat: number, lon: number, name?: string) => {
    console.log("Location:", name, lat, lon);

    // Drop marker where user searched
    setMarker([lat, lon]);

    // Example route (Bangalore → searched location)
    setRoute([
      [12.9716, 77.5946],
      [lat, lon],
    ]);
  };

  return (
    <>
      <SearchBox onSearch={handleSearch} />
      <MapView routeCoords={route} marker={marker} />
    </>
  );
};

export default App;
