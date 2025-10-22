
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
import DisplayNotification from "./components/Headers/DisplayNotification";
import store from "./variables/reducerStore";
import NewLanding from "views/NewLanding.js";
import Auth from "views/Auth.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <DisplayNotification>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/landing" element={<NewLanding />} />
          <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
      </DisplayNotification>
    </BrowserRouter>
  </Provider>
);
