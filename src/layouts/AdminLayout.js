import React, { useState, useEffect } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import routes from "../routes.js";
import ApplicationWrapper from "views/ApplicationWrapper.js";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";

function AdminLayout() {
  const userContext = null;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "New User", role: "" }); // Dynamic user data

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(endpoints.user.profile.get.url, {
          withCredentials: true,
        });
      setCurrentUser(response.data.user); // Assuming response.data.user contains name and role
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch user profile."));
      // Redirect to login if unauthorized
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "" : "";
  };

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
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
        <ApplicationWrapper user={userContext}>
          <Routes>{getRoutes(routes)}</Routes>
        </ApplicationWrapper>
      </div>
    </div>
  );
}

export default AdminLayout;
