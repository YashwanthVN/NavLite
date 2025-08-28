import React, { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onFromSelect: (
    lat: number,
    lon: number,
    display_name: string,
    bbox?: [number, number, number, number]
  ) => void;
  onToSelect: (
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

const SearchBar: React.FC<SearchBarProps> = ({ onFromSelect, onToSelect }) => {
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Fetch suggestions when typing
  useEffect(() => {
    const query = activeField === "from" ? fromQuery : toQuery;
    if (!query || query.length < 3) {
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
    }, 300);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [fromQuery, toQuery, activeField]);

  // Handle selecting suggestion
  const handleSelect = (s: Suggestion) => {
  let bbox: [number, number, number, number] | undefined;

  if (s.boundingbox && s.boundingbox.length === 4) {
    bbox = [
      parseFloat(s.boundingbox[0]),
      parseFloat(s.boundingbox[1]),
      parseFloat(s.boundingbox[2]),
      parseFloat(s.boundingbox[3]),
    ] as [number, number, number, number];
  }

  if (activeField === "from") {
    setFromQuery(s.display_name);
    onFromSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name, bbox);
  } else if (activeField === "to") {
    setToQuery(s.display_name);
    onToSelect(parseFloat(s.lat), parseFloat(s.lon), s.display_name, bbox);
  }

  setSuggestions([]);
  setActiveField(null);

  if (activeField === "from") {
    document.querySelector<HTMLInputElement>("input[placeholder='From']")?.blur();
  } else if (activeField === "to") {
    document.querySelector<HTMLInputElement>("input[placeholder='To']")?.blur();
  }
};

  return (
    <div
      style={{
        position: "absolute",
        top: "15px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "400px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        padding: "8px",
      }}
    >
      {/* From input */}
      <input
        type="text"
        placeholder="From"
        value={fromQuery}
        onChange={(e) => {
          setFromQuery(e.target.value);
          setActiveField("from");
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          fontSize: "14px",
          marginBottom: "8px",
          outline: "none",
        }}
      />

      {/* To input */}
      <input
        type="text"
        placeholder="To"
        value={toQuery}
        onChange={(e) => {
          setToQuery(e.target.value);
          setActiveField("to");
        }}
        style={{
          width: "100%",
          boxSizing: "border-box", 
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          fontSize: "14px",
          outline: "none",
        }}
      />

      {/* Suggestions dropdown */}
      {loading && (
        <div style={{ padding: "10px", fontSize: "14px" }}>⏳ Searching...</div>
      )}

      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            margin: "6px 0 0 0",
            padding: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background = "#f1f3f4")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background = "transparent")
              }
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
