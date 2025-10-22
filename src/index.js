
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import "./assets/scss/paper-dashboard.scss";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/custom.css'; // Your custom CSS file

import AdminLayout from "./layouts/Admin.js";
import GuestLayout from "./layouts/Guest.js";
import DisplayNotification from "./components/Headers/DisplayNotification";
import store from "./variables/reducerStore";
import HealthCheck from "views/HealthCheck";
// import { addBasename } from "variables/slices/basenameSlice.js"; // Removed basename logic

const root = ReactDOM.createRoot(document.getElementById("root"));
// const basename = "/paper-dashboard-react"; // Removed basename logic

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <DisplayNotification>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/auth/*" element={<GuestLayout />} />
          <Route path="/health" element={<HealthCheck />} /> {/* Health Check route */}
          <Route path="/" element={<Navigate to="/auth" replace />} /> {/* Default to auth page */}
        </Routes>
      </DisplayNotification>
    </BrowserRouter>
  </Provider>
);
