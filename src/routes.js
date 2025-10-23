import React from "react";

import Dashboard from "./views/Dashboard.js";
import AuthenticationPage from "./views/AuthenticationPage.js"; // Updated import
import LandingPage from "./views/Landing.js";
import HealthCheck from "./views/HealthCheck.js";
import RegistrationPage from "./views/RegistrationPage.js"; // Import the new RegistrationPage component
import TelegramCallbackPage from "./views/TelegramCallbackPage.js"; // Import the new TelegramCallbackPage
import CourseScraper from "./components/Progressme/CourseScraper.js";
import ScheduleBuilder from "./components/Progressme/ScheduleBuilderV8.jsx";
import CourseBuilder from "./components/Progressme/CourseBuilder.js";
import TeacherAssistant from "./views/TeacherAssistant.js";
import UserProfile from "./views/UserProfile.js";
import Integrations from "./views/Integrations.js";
// import store from "./variables/reducerStore"; // Removed unused import

// const basename = store.getState().basenames[0] // Removed unused basename variable
var routes = [
  {
    path: "/health",
    name: "Health Check",
    icon: "nc-icon nc-check-2",
    component: <HealthCheck />,
    layout: "",
  },
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-bank",
    component: <AuthenticationPage />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "nc-icon nc-badge",
    component: <RegistrationPage />,
    layout: "/auth",
  },
  {
    path: "/telegram/callback", // New route for Telegram callback
    name: "Telegram Callback",
    icon: "nc-icon nc-chat-33", // A relevant icon
    component: <TelegramCallbackPage />,
    layout: "/auth", // Part of the authentication flow
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "fas fa-th-large",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/course-scraper",
    name: "Course Scraper",
    icon: "fas fa-book",
    component: <CourseScraper />,
    layout: "/admin",
  },
  {
    path: "/schedule-builder",
    name: "Schedule Builder",
    icon: "fas fa-calendar-alt",
    component: <ScheduleBuilder />,
    layout: "/admin",
  },
  {
    path: "/course-builder",
    name: "Course Builder",
    icon: "fas fa-ruler-combined",
    component: <CourseBuilder />,
    layout: "/admin",
  },
  {
    path: "/teacher-assistant",
    name: "Teacher Assistant",
    icon: "fas fa-user-plus",
    component: <TeacherAssistant />,
    layout: "/admin",
  },
  {
    path: "/integrations",
    name: "Integrations",
    icon: "fas fa-link",
    component: <Integrations />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "fas fa-user-circle",
    component: <UserProfile />,
    layout: "/admin",
  },
  {
    path: "/",
    name: "Landing",
    icon: "nc-icon nc-bank",
    component: <LandingPage />,
    layout: "/landing",
  },
];
export const NotificationContext = React.createContext(null);

export default routes;
