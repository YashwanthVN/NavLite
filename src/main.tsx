import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Global styles
import "./index.css";
import "leaflet/dist/leaflet.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Did you forget <div id='root'></div> in index.html?");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
