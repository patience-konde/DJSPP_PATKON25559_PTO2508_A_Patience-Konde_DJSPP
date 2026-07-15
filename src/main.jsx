/**
 * Entry point for the podcast application.
 * Bootstraps the React app and mounts it into the DOM.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "/styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
