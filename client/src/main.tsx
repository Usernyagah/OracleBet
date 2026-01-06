import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Validate environment variables on startup
// This will throw if env vars are invalid, which is caught by ErrorBoundary
import './lib/env';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
