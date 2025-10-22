import NewDashboard from "views/NewDashboard.js";
import NewLanding from "views/NewLanding.js";
import Auth from "views/Auth.js";
import CourseScraper from "views/CourseScraper.js";
import CourseBuilder from "views/CourseBuilder.js";
import ScheduleBuilder from "views/ScheduleBuilder.js";
import Bot from "views/Bot.js";
import React from "react";
import store from "./variables/reducerStore";

const basename = store.getState().basenames[0];

var routes = [
  {
    path: (basename || "") + "/landing",
    name: "Landing",
    icon: "nc-icon nc-bank",
    component: <NewLanding />,
    layout: "",
  },
  {
    path: (basename || "") + "/auth",
    name: "Authentication",
    icon: "nc-icon nc-key-25",
    component: <Auth />,
    layout: "",
  },
  {
    path: (basename || "") + "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-36",
    component: <NewDashboard />,
    layout: (basename || "") + "/admin",
  },
  {
    path: (basename || "") + "/course-scraper",
    name: "Course Scraper",
    icon: "nc-icon nc-tap-01",
    component: <CourseScraper />,
    layout: (basename || "") + "/admin",
  },
  {
    path: (basename || "") + "/course-builder",
    name: "Course Builder",
    icon: "nc-icon nc-settings-gear-65",
    component: <CourseBuilder />,
    layout: (basename || "") + "/admin",
  },
  {
    path: (basename || "") + "/schedule-builder",
    name: "Schedule Builder",
    icon: "nc-icon nc-calendar-60",
    component: <ScheduleBuilder />,
    layout: (basename || "") + "/admin",
  },
  {
    path: (basename || "") + "/bot",
    name: "Bot",
    icon: "nc-icon nc-chat-33",
    component: <Bot />,
    layout: (basename || "") + "/admin",
  },
];

export const NotificationContext = React.createContext(null);

export default routes;
