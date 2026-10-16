import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";

// Every full page load starts at the hero, before reveal observers are mounted.
// In-page anchor navigation continues to work after startup.
window.history.scrollRestoration = 'manual';
if(!window.location.hash.startsWith('#herramienta/'))window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#asistente`);
window.scrollTo({top:0,left:0,behavior:'instant'});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
