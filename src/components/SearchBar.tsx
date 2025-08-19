import React, { useState } from "react";

interface SearchBoxProps {
  onSearch: (lat: number, lon: number, name?: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onSearch(parseFloat(lat), parseFloat(lon), display_name);
      } else {
        alert("No results found");
      }
    } catch (err) {
      console.error("Error fetching from Nominatim:", err);
    }
  };

  return (
    <div
      style={{
        padding: "8px",
        background: "#fff",
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
        style={{ padding: "6px", minWidth: "250px" }}
      />
      <button
        onClick={handleSearch}
        style={{ marginLeft: "6px", padding: "6px 12px" }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBox;
