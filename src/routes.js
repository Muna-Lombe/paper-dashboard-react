
import Dashboard from "views/Dashboard.js";
import UserPage from "views/User.js";
import AuthenticationPage from "views/AuthenticationPage.js";
import LandingPage from "views/Landing.js";
import HealthCheck from "views/HealthCheck.js"; // Import the new HealthCheck component
import React from "react";

var routes = [
  {
    path: "/health", // Simple path for health check
    name: "Health Check",
    icon: "nc-icon nc-check-2", // A relevant icon
    component: <HealthCheck />,
    layout: "", // No layout for this route
  },
  {
    path: "/",
    name: "Auth",
    icon: "nc-icon nc-bank",
    component: <AuthenticationPage />,
    layout: "/auth",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/user-page",
    name: "User Profile",
    icon: "nc-icon nc-single-02",
    component: <UserPage />,
    layout: "/admin",
  },
  {
    path: "/landing",
    name: "Landing",
    icon: "nc-icon nc-bank",
    component: <LandingPage />,
    layout: "/auth",
  },
];
export const NotificationContext = React.createContext(null);

export default routes;
