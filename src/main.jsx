// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";
import "./index.css";

// Auth0 configuration
const domain = "dev-sbalk02vrxvon3hk.us.auth0.com";
const clientId = "qmDe5Vg04bSBdDj5fIuYYKX5XsEaLTpK";
const redirectUri = `${window.location.origin}/dashboard`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
