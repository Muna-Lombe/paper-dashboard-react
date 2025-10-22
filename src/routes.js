
import Dashboard from "views/Dashboard.js";
import UserPage from "views/User.js";
import AuthenticationPage from "views/AuthenticationPage.js";
import LandingPage from "views/Landing.js";
import HealthCheck from "views/HealthCheck.js"; // Import the new HealthCheck component
import React from "react";
import store from "./variables/reducerStore";

const basename = store.getState().basenames[0]
var routes = [
  {
    path: (basename||"")+"/landing",
    name: "Landing",
    icon: "nc-icon nc-bank",
    component: <LandingPage />,
    layout: "",
  },
  {
    path: (basename||"")+"/sign-in",
    name: "Sign in",
    icon: "nc-icon nc-bank",
    component: <AuthenticationPage />,
    layout: "",
  },
  {
    path: (basename||"")+"/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-bank",
    component: <Dashboard />,
    layout: (basename||"")+"/admin",
  },
  {
    path: "/health", // Simple path for health check
    name: "Health Check",
    icon: "nc-icon nc-check-2", // A relevant icon
    component: <HealthCheck />,
    layout: "", // No layout for this route
  },
  // {
  //   path: (basename||"")+"/icons",
  //   name: "Icons",
  //   icon: "nc-icon nc-diamond",
  //   component: <Icons />,
  //   layout: (basename||"")+"/admin",
  // },
  // {
  //   path: (basename||"")+"/maps",
  //   name: "Maps",
  //   icon: "nc-icon nc-pin-3",
  //   component: <Maps />,
  //   layout: (basename||"")+"/admin",
  // },
  // {
  //   path: (basename||"")+"/notifications",
  //   name: "Notifications",
  //   icon: "nc-icon nc-bell-55",
  //   component: <Notifications />,
  //   layout: (basename||"")+"/admin",
  // },
  {
    path: (basename||"")+"/user-page",
    name: "User Profile",
    icon: "nc-icon nc-single-02",
    component: <UserPage />,
    layout: (basename||"")+"/admin",
  },
  // {
  //   path: (basename||"")+"/tables",
  //   name: "Table List",
  //   icon: "nc-icon nc-tile-56",
  //   component: <TableList />,
  //   layout: (basename||"")+"/admin",
  // },
  // {
  //   path: (basename||"")+"/typography",
  //   name: "Typography",
  //   icon: "nc-icon nc-caps-small",
  //   component: <Typography />,
  //   layout: (basename||"")+"/admin",
  // },
  // {
  //   pro: true,
  //   path: (basename||"")+"/upgrade",
  //   name: "Upgrade to PRO",
  //   icon: "nc-icon nc-spaceship",
  //   component: <UpgradeToPro />,
  //   layout: (basename||"")+"/admin",
  // },
];
export const NotificationContext = React.createContext(null)

export default routes;
