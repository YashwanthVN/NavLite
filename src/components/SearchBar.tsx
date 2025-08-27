import React, { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onSelect: (
    lat: number,
    lon: number,
    display_name: string,
    bbox?: [number, number, number, number]
  ) => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Nominatim fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 200); // smaller debounce = faster UX

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.display_name);
    setSuggestions([]);

    let bbox: [number, number, number, number] | undefined;
    if (s.boundingbox && s.boundingbox.length === 4) {
      bbox = [
        parseFloat(s.boundingbox[0]),
        parseFloat(s.boundingbox[2]),
        parseFloat(s.boundingbox[1]),
        parseFloat(s.boundingbox[3]),
      ];
    }

    onSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name, bbox);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "320px",
        background: "#fff",
        borderRadius: "6px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "4px",
      }}
    >
      <div style={{ display: "flex" }}>
        <input
          type="text"
          placeholder="Search location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "6px 0 0 6px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={() => {
            if (suggestions.length > 0) handleSelect(suggestions[0]);
          }}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "0 6px 6px 0",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {loading && <div style={{ padding: "6px" }}>⏳ Loading...</div>}

      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "5px 0 0 0",
            maxHeight: "150px",
            overflowY: "auto",
            border: "1px solid #ccc",
            background: "#fff",
            borderRadius: "6px",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s)}
              style={{
                padding: "6px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
