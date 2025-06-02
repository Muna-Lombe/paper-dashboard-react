import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Routes, useLocation,Navigate  } from "react-router-dom";

import DemoNavbar from "@/components/Navbars/DemoNavbar.js";
import Footer from "@/components/Footer/Footer.js";
import Sidebar from "@/components/Sidebar/Sidebar.js";
import FixedPlugin from "@/components/FixedPlugin/FixedPlugin.js";

import routes from "@/routes.js";
import { endpoints } from "@/config";

var ps;

function Dashboard(props) {
  const [backgroundColor, setBackgroundColor] = React.useState("black");
  const [activeColor, setActiveColor] = React.useState("info");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const mainPanel = React.useRef();
  const location = useLocation();
 


  

  React.useEffect(() => {
    // Initialize PerfectScrollbar only when mainPanel.current is available
    // and we are not in the loading state, and it's a Windows platform.
    if (mainPanel.current && navigator.platform.indexOf("Win") > -1 && !isLoading) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.add("perfect-scrollbar-on"); // Use add, not toggle, for clarity
    }
    return function cleanup() {
      if (ps && navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        ps = null; // Clear the ps variable
        document.body.classList.remove("perfect-scrollbar-on"); // Use remove
      }
    };
    // Add isLoading to the dependency array so this effect re-runs when isLoading changes.
    // This ensures that if it was loading and then finishes, PerfectScrollbar gets initialized.
  }, [isLoading, location]); // also re-run if location changes to potentially re-init or ensure scroll to top

  React.useEffect(() => {
    // Ensure scrollTop is only accessed if mainPanel.current exists
    if (mainPanel.current) {
      mainPanel.current.scrollTop = 0;
    }
    if (document.scrollingElement) { // document.scrollingElement can also be null
      document.scrollingElement.scrollTop = 0;
    }
  }, [location]);

  const handleActiveClick = (color) => {
    setActiveColor(color);
  };
  const handleBgClick = (color) => {
    setBackgroundColor(color);
  };


  React.useEffect(() => {
    const checkAuth = async () => {
      
      
      try {
        const token = sessionStorage.getItem('expirableToken');
        
        if (!token) {
          setIsAuthenticated(false);
          // setIsLoading(false); // setIsLoading is handled in finally
          return;
        }else {
          const expireAt = token.split('~expireAt~')[1];
          const currentTime = new Date();
          const isExpired = new Date(expireAt) < currentTime;
  
          console.log("tokent is expired", isExpired);
          
          if (isExpired) {
            setIsAuthenticated(false);
            // setIsLoading(false); // setIsLoading is handled in finally
            return;
          }
        }
        setIsAuthenticated(true);
        // setIsLoading(false); // setIsLoading is handled in finally
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div>Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/sign-in' replace />
  }

  return (
    <div className="wrapper">
      <Sidebar
        {...props}
        routes={routes}
        bgColor={backgroundColor}
        activeColor={activeColor}
      />
      <div className="main-panel" ref={mainPanel}>
        <DemoNavbar {...props} />
        <Routes>
          {routes.map((prop, key) => {
            return (
              <Route
                path={prop.path}
                element={prop.component}
                key={key}
                exact
              />
            );
          })}
        </Routes>
        <Footer fluid />
      </div>
      {/* <FixedPlugin
        bgColor={backgroundColor}
        activeColor={activeColor}
        handleActiveClick={handleActiveClick}
        handleBgClick={handleBgClick}
      /> */}
    </div>
  );
}

export default Dashboard;
