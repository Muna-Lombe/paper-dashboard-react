import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addError } from "variables/slices/errorSlice";
import { addToast } from "variables/slices/toastSlice";
import useAuth from "variables/hooks/useAuth";
import axios from "axios";
axios.defaults.withCredentials = true;
import { endpoints } from "@/config";

function TelegramCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loginUser } = useAuth(); // Assuming loginUser can also handle Telegram response

  useEffect(() => {
    const processTelegramAuth = async () => {
      const params = new URLSearchParams(location.search);
      const userData = {};
      for (const [key, value] of params.entries()) {
        userData[key] = value;
      }

      if (userData.id && userData.hash) {
        try {
          const response = await axios.post(endpoints.telegram.authUrl, userData);

          if (response.data.token && response.data.userId) {
            // Assuming your backend returns a token and userId after validating Telegram data
            // You might need to adjust loginUser or create a new loginWithTelegram function in useAuth
            const success = await loginUser(userData.id, response.data.token); // Placeholder, adjust as needed

            if (success) {
              dispatch(addToast("Logged in with Telegram successfully!"));
              navigate("/admin/dashboard");
            } else {
              dispatch(addError("Telegram login failed after backend verification."));
              navigate("/auth");
            }
          } else {
            dispatch(addError("Telegram authentication failed: Invalid response from backend."));
            navigate("/auth");
          }
        } catch (error) {
          dispatch(addError(error.response?.data?.msg || "Telegram authentication failed due to server error."));
          console.error("Telegram auth callback error:", error);
          navigate("/auth");
        }
      } else {
        dispatch(addError("Telegram authentication failed: Missing user data."));
        navigate("/auth");
      }
    };

    processTelegramAuth();
  }, [location, navigate, dispatch, loginUser]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Processing Telegram Login...</h1>
      <p>Please wait while we log you in.</p>
    </div>
  );
}

export default TelegramCallbackPage;
