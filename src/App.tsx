import React, { useState } from "react";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";

const App: React.FC = () => {
  const [from, setFrom] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [to, setTo] = useState<{ lat: number; lon: number; name: string } | null>(null);

  return (
    <>
      {/* Single SearchBar handles FROM and TO + swap internally */}
      <SearchBar
        onFromSelect={(lat: number, lon: number, name: string) =>
          setFrom({ lat, lon, name })
        }
        onToSelect={(lat: number, lon: number, name: string) =>
          setTo({ lat, lon, name })
        }
      />

      {/* Map takes both FROM and TO */}
      <MapView from={from} to={to} />
    </>
  );
};

export default App;
