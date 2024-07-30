/*!

=========================================================
* Paper Dashboard React - v1.3.2
=========================================================

* Product Page: https://www.creative-tim.com/product/paper-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

* Licensed under MIT (https://github.com/creativetimofficial/paper-dashboard-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";

import AdminLayout from "./layouts/Admin.js";
import GuestLayout from "./layouts/Guest.js";
import DisplayNotification from "./components/Headers/DisplayNotification";
import store from "./variables/reducerStore";
import { addBasename } from "variables/basenameSlice.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
const basename = "/paper-dashboard-react";
const AuthedRoute = () => (
  sessionStorage.getItem('token') ? (
    <AdminLayout />
  ) : (
    <Navigate to='/sign-in' replace />
  )

)


//store.dispatch(addBasename(basename));
sessionStorage.setItem('token', 1)
root.render(
  <Provider store={store}>
    <BrowserRouter basename={"/"+basename}>
    
      <DisplayNotification>
        <Routes>

          <Route path="/admin/*" element={<AuthedRoute/>} />
          <Route path="/*" element={<GuestLayout />} />
          
          <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
      
      </DisplayNotification>  
    </BrowserRouter>

  </Provider>
);
