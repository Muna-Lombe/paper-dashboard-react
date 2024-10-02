
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/paper-dashboard.scss?v=1.3.0";
import "assets/demo/demo.css";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/custom.css' // Your custom CSS file

import AdminLayout from "./layouts/Admin.js";
import GuestLayout from "./layouts/Guest.js";
import DisplayNotification from "./components/Headers/DisplayNotification";
import store from "./variables/reducerStore";
import { addBasename } from "variables/slices/basenameSlice.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
const basename = "/paper-dashboard-react";

sessionStorage.setItem('token', 1);

const AuthedRoute = () => (
  sessionStorage.getItem('token') ? (
    <AdminLayout />
  ) : (
    <Navigate to='/sign-in' replace />
  )

)


//store.dispatch(addBasename(basename));


root.render(
  <Provider store={store}>
    <BrowserRouter>
    
      <DisplayNotification>
        <Routes>

          <Route path={(store.getState().basenames[0]||"")+"/admin/*"} element={<AuthedRoute/>} />
          <Route path={(store.getState().basenames[0]||"")+"/*"} element={<GuestLayout />} />
          
          <Route path={(store.getState().basenames[0]||"")+"/"} element={<Navigate to={(store.getState().basenames[0]||"")+"/landing" }replace />} />
        </Routes>
      
      </DisplayNotification>  
    </BrowserRouter>

  </Provider>
);
