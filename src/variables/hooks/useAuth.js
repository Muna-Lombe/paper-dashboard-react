import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addError } from "@/variables/slices/errorSlice";
import { addToast } from "@/variables/slices/toastSlice";
import { endpoints } from "@/config";
import { useState, useEffect } from "react";
import axios from "axios";

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  // const { basenames } = useSelector((state) => state.basenames);
  // Optional: Add isLoading state if you want to track loading status within the hook
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("expirableToken");
    const storedUserId = sessionStorage.getItem("userId");
    if (storedToken && storedUserId) {
      const tokenParts = storedToken.split("~expireAt~");
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
    sessionStorage.removeItem("Auth-Token"); // Also remove the direct Auth-Token
    sessionStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserId(null);
    navigate("/auth"); // Redirect to login page on logout
  };

  const authenticateUser = async (authToken) => {
    // Optional: setIsLoading(true);

    if (!authToken) {
      const errorMsg = "Please enter an authentication token";
      dispatch(addError(errorMsg));
      return false;
    }

    let resData = null;

    try {
      const response = await fetch(endpoints.auth.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authToken,
        },
        body: JSON.stringify({
          token: authToken,
        }),
      });

      resData = await response.json();
      const FiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

      if (!response.ok) {
        const errorMsg = resData.message || `Authentication failed with status: ${response.status}`;
        dispatch(addError(errorMsg));
        return false;
      }

      if (resData.token) {
        dispatch(addToast("Authentication successful!"));
        sessionStorage.setItem("expirableToken", resData.token + "~expireAt~" + FiveDaysFromNow);
        // Assuming userId is part of the token response, or needs to be fetched
        // For now, setting a placeholder or assuming it's part of the response
        // You might need to adjust this based on your actual API response
        const fetchedUserId = resData.data?.Value?.Id || "placeholder_user_id"; // Adjust this line
        sessionStorage.setItem("userId", fetchedUserId);
        sessionStorage.setItem("Auth-Token", resData.token);
        setIsAuthenticated(true);
        setUserId(fetchedUserId);
        return true;
      } else {
        const errorMsg = resData.message || "Authentication failed: Invalid token.";
        dispatch(addError(errorMsg));
        return false;
      }
    } catch (err) {
      const errorMsg = "Connection error! Please retry in a minute.";
      dispatch(addError(errorMsg));
      console.error("Authentication fetch/processing error:", err);
      return false;
    } finally {
      // Optional: setIsLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    // setIsLoading(true);
    try {
      // This part is crucial: get a temporary Auth-Token if not already present
      // This logic was originally in LoginPage.js and needs to be retained if the backend requires it.
      if (!sessionStorage.getItem("Auth-Token")) {
        const tokenResponse = await axios.get(
          endpoints.paperDashApi.getToken.url,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Authorization": "Bearer " + sessionStorage.getItem("expirableToken"),
            },
          },
        );
        sessionStorage.setItem("Auth-Token", tokenResponse.data.token);
      }

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
            "Authorization": "Bearer " + sessionStorage.getItem("Auth-Token"),
          },
        },
      );

      if (response.data.token) {
        const FiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
        sessionStorage.setItem("Auth-Token", response.data.token);
        sessionStorage.setItem("expirableToken", response.data.token + "~expireAt~" + FiveDaysFromNow);
        sessionStorage.setItem("userId", response.data.data.Value.Id);
        setIsAuthenticated(true);
        setUserId(response.data.data.Value.Id);
        dispatch(addToast("Login successful!"));
        return true;
      } else {
        dispatch(addError(response.data?.msg || "Login failed: Invalid credentials."));
        return false;
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.msg || "Login failed due to server error."));
      console.error("Login fetch/processing error:", error);
      return false;
    } finally {
      // setIsLoading(false);
    }
  };

  return { isAuthenticated, userId, authenticateUser, loginUser, logoutUser /*, isLoading */ };
};

export default useAuth; 