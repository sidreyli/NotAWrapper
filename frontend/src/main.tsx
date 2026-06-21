import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { I18nProvider } from "./i18n";
import { OptionalClerkProvider } from "./auth/OptionalClerkProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OptionalClerkProvider>
      <AppStateProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AppStateProvider>
    </OptionalClerkProvider>
  </React.StrictMode>
);
