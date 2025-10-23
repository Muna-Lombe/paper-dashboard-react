import React from 'react'
import { Link } from 'react-router-dom';

function ApplicationWrapper(props) {
  let user = {
    name: "New User",
    role: "Projects Teacher",
  }
  if (props.user) {
    user = props.user;
  }

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: "fas fa-th-large",
      href: "/admin/dashboard",
    },
    {
      name: "Course Scraper",
      icon: "fas fa-book",
      href: "/admin/course-scraper",
    },
    {
      name: "Schedule Builder",
      icon: "fas fa-calendar-alt",
      href: "/admin/schedule-builder",
    },
    {
      name: "Course Builder",
      icon: "fas fa-ruler",
      href: "/admin/course-builder",
    },
    {
      name: "Teacher Assistant",
      icon: "fas fa-user-plus",
      href: "/admin/teacher-assistant",
    },
    {
      name: "Integrations",
      icon: "fas fa-link",
      href: "/admin/integrations",
    },
    
    
  ]

  return (
    <div className="h-screen w-full bg-gray-100 p-6">
      {/* Header */}
      <header className="h-1/12 flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src="/path/to/logo.png" alt="Captain Learning Logo" className="h-10" /> {/* Replace with actual logo path */}
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Hello {user.name || "User"}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search here"
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <i className="fas fa-bell text-gray-600 text-xl cursor-pointer"></i>
          <img src="/path/to/user-avatar.png" alt="User Avatar" className="h-10 w-10 rounded-full cursor-pointer" /> {/* Replace with actual avatar path */}
          <div className="text-right">
            <p className="font-semibold text-gray-800">Abdelrahman Nader</p>
            <p className="text-sm text-gray-600">Projects Teacher</p>
          </div>
          <i className="fas fa-chevron-down text-gray-600 cursor-pointer"></i>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="h-11/12 w-full flex flex-row gap-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="h-[80%] w-1/6 flex flex-col justify-between bg-white p-4 rounded-lg shadow-md">
          <nav>
            <ul>
              {sidebarItems.map((item, index) => (
                <li key={index} className="mb-4">
                  <a href={item.href} className="flex items-center space-x-3 text-blue-600 font-semibold">
                    <i className={item.icon}></i>
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
              
            </ul>
          </nav>
          <div className="mt-8 pt-4 border-t border-gray-200">
            <a href="/admin/user-profile" className="py-2 flex items-center space-x-3 text-gray-600 font-semibold">
              <i className="fas fa-user"></i>
              <span>{user.name}</span>
            </a>
            <a href="#" className="py-2 flex items-center space-x-3 text-red-600 font-semibold">
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </div>
        </aside>

        {/* Central Content */}
        <main className="h-[95%] w-5/6 overflow-clip">
          <div className="h-full w-full overflow-y-scroll">
            {props.children}

          </div>
        </main>

      </div>
    </div>
  )
}

export default ApplicationWrapper