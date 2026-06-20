import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { OptionalClerkProvider } from "./auth/OptionalClerkProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OptionalClerkProvider>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </OptionalClerkProvider>
  </React.StrictMode>
);
