import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import routes from "../routes.js";
import ApplicationWrapper from "views/ApplicationWrapper.js";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";

function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState({
    name: "New User",
    role: "Projects Teacher",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await endpoints.user.profile.get.request();
      setCurrentUser(
        response.data.user || {
          name: "New User",
          role: "Projects Teacher",
        }
      );
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to fetch user profile.")
      );
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  const getRoutes = (routeList) =>
    routeList.map((prop, key) => {
      if (prop.layout === "/admin") {
        return <Route path={prop.path} element={prop.component} key={key} />;
      }
      return null;
    });

  return (
    <div className="wrapper h-dvh overflow-hidden">
      <div className="main-panel h-full">
        <ApplicationWrapper user={currentUser}>
          <Routes>{getRoutes(routes)}</Routes>
        </ApplicationWrapper>
      </div>
    </div>
  );
}

export default AdminLayout;
