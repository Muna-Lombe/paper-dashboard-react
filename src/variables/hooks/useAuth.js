import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addError, clearErrors, removeError } from "../slices/errorSlice"; // Assuming clearErrors is available
import { addToast } from "../slices/toastSlice";
import { endpoints } from "../../config";
import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.withCredentials = true;

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // On mount, check if a user is already authenticated (e.g., by HttpOnly cookie)
    // The AdminLayout will attempt to fetch user profile, which will validate the cookie
    // and redirect to login if unauthorized. So, we don't need extensive sessionStorage checks here.
    // However, we should still try to get the userId from sessionStorage if it exists
    // as a fallback or for initial rendering before the API call in AdminLayout completes.
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
    // If AdminLayout redirects to login, isAuthenticated will become false.

  }, []);

  const register = async (email, password) => {
    setIsLoading(true);
    dispatch(clearErrors()); // Clear previous errors
    try {
      const response = await axios.post(endpoints.auth.register.url, { email, password });
      if (response.status === 200) {
        
        return {success: true, message: "Registration successful! Please log in."};
      }
      return {success: false, message: response.data?.msg || "Registration failed. Please try again."};
    }
    catch (error) {
      // dispatch(addError(error.response?.data?.msg || "Registration failed. Please try again."));
      return false;
    }
  }
  const login = async (email, password) => {
    setIsLoading(true);
    dispatch(clearErrors()); // Clear previous errors
    try {
      const response = await axios.post(endpoints.auth.login.url, { email, password });
      // console.log("resp", response);
      
      if (response.status === 200) {
        // Assuming HttpOnly cookie handles token, no need to store in sessionStorage
        setIsAuthenticated(true);
        setUserId(response.data.user.id); // Assuming user ID is returned in response.data.user
        sessionStorage.setItem("userId", response.data.user.id); // Store for initial load check in useEffect
        // dispatch(addToast("Login successful!"));
        return {success: true, message: "Login successful!"};

      } else {
        return {success: false, message: response.data?.msg || "Login failed."};
      }
    } catch (error) {
      // console.error("Login error:", error);
      // dispatch(addError(error.response?.data?.msg || "Login failed. Please try again."));
      return {success: false, message: error.response?.data?.msg};
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async() => {
    // Invalidate the HttpOnly cookie on the backend
    // For now, we just clear local state and assume backend will handle cookie invalidation on next request
    console.log("url", endpoints.auth.logout.url);
    
    const response = await axios.post(endpoints.auth.logout.url);
      // console.log("resp", response);
      
    if (response.status === 200) {
      setIsAuthenticated(false);
      setUserId(null);
      sessionStorage.removeItem("userId"); // Clear userId from sessionStorage
      sessionStorage.removeItem("Auth-Token"); // Ensure any old tokens are cleared
      sessionStorage.removeItem("expirableToken"); // Ensure any old tokens are cleared
      dispatch(addToast("Logged out successfully."));
      navigate("/login"); // Redirect to login page
    }
  };

  const getProgressmeUser = async(apiToken) => {
    const response = await axios.post(endpoints.paperDashApi.authenticateUser.url, { apiToken });
      // console.log("resp", response);
      
    if (response.status === 200) {
      const {token, data} = response.data
      sessionStorage.setItem("Auth-Token", token); // Ensure any old tokens are cleared
       // Redirect to login page
       return {
         success: true,
         message: "Get user info successful", 
         data
       }
    } else {
      return {
        success: false,
        message: "Failed to get user info"
      }
    }
  }

  return {
    isAuthenticated,
    userId,
    isLoading,
    login,
    register,
    logout,
    getProgressmeUser
  };
}

export default useAuth; 