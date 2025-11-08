
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";

import "./assets/css/tailwind.css"; // Import Tailwind CSS
import AdminLayout from "./layouts/AdminLayout";
import GuestLayout from "./layouts/GuestLayout";
import ToastContainer from "./components/ToastContainer";
import ErrorContainer from "./components/ErrorContainer";

import store from "./variables/reducerStore";
import HealthCheck from "views/HealthCheck";
// import HealthCheck from "views/HealthCheck";
// import { addBasename } from "variables/slices/basenameSlice.js"; // Removed basename logic

const root = ReactDOM.createRoot(document.getElementById("root"));
// const basename = "/paper-dashboard-react"; // Removed basename logic

root.render(
  <Provider store={store}>
    <BrowserRouter>
      {/* Global Notification Containers */}
      <ToastContainer />
      <ErrorContainer />
      
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/health" element={<HealthCheck />} /> {/* Health Check route */}
        <Route path="/*" element={<GuestLayout />} />
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> Default to auth page */}
      </Routes>
      
    </BrowserRouter>
  </Provider>
);
