import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addError } from "@/variables/slices/errorSlice";
import { addToast } from "@/variables/slices/toastSlice";
import { endpoints } from "@/config";
import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedAuthToken = sessionStorage.getItem("Auth-Token");
    const storedExpirableToken = sessionStorage.getItem("expirableToken");
    const storedUserId = sessionStorage.getItem("userId");

    if (storedAuthToken && storedExpirableToken && storedUserId) {
      const tokenParts = storedExpirableToken.split("~expireAt~");
      if (tokenParts.length === 2) {
        const expiryDate = new Date(tokenParts[1]);
        if (expiryDate > new Date()) {
          setIsAuthenticated(true);
          setUserId(storedUserId);
        } else {
          logoutUser(); // Token expired
        }
      }
    }
  }, []);

  const logoutUser = () => {
    sessionStorage.removeItem("expirableToken");
    sessionStorage.removeItem("Auth-Token");
    sessionStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserId(null);
    navigate("/auth");
  };

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(
        endpoints.paperDashApi.authenticate.url,
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      if (response.data.token && response.data.data?.Value?.Id) {
        const FiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
        sessionStorage.setItem("Auth-Token", response.data.token);
        sessionStorage.setItem("expirableToken", response.data.token + "~expireAt~" + FiveDaysFromNow);
        sessionStorage.setItem("userId", response.data.data.Value.Id);
        setIsAuthenticated(true);
        setUserId(response.data.data.Value.Id);
        dispatch(addToast("Login successful!"));
        return true;
      } else {
        dispatch(addError(response.data?.msg || "Login failed: Invalid credentials or missing user ID."));
        return false;
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Login failed due to server error."));
      console.error("Login fetch/processing error:", error);
      return false;
    }
  };

  return { isAuthenticated, userId, loginUser, logoutUser };
};

export default useAuth; 