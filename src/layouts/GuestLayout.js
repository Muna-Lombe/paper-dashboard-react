import React from "react";
import { Route, Routes } from "react-router-dom";
import routes from "../routes.js";

function GuestLayout() {
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth" || prop.layout === "/landing") {
        return (
          <Route
            path={prop.path}
            element={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  return (
    <div className="wrapper">
      <div className="main-panel">
        <Routes>{getRoutes(routes)}</Routes>
      </div>
    </div>
  );
}

export default GuestLayout;
