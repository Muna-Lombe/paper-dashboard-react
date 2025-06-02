import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addError } from "@/variables/slices/errorSlice";
import { addToast } from "@/variables/slices/toastSlice";
import { endpoints } from "@/config";

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { basenames } = useSelector((state) => state.basenames);
  // Optional: Add isLoading state if you want to track loading status within the hook
  // const [isLoading, setIsLoading] = useState(false);

  const authenticateUser = async (authToken) => {
    // Optional: setIsLoading(true);

    if (!authToken) {
      const errorMsg = "Please enter an authentication token";
      dispatch(addError(errorMsg));
      dispatch(addToast({ message: errorMsg, type: "error" }));
      // Optional: setIsLoading(false);
      return;
    }

    // Store the token
    sessionStorage.setItem("expirableToken", authToken);

    const url = endpoints.auth.url;
    let resData = null;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + authToken, // Directly use the passed authToken
        },
        body: JSON.stringify({
          token: authToken,
        }),
      });

      resData = await response.json();
      const FiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); 
      if (!response.ok) { // Check response.ok for HTTP errors like 400
        const errorMsg = resData.message || `Authentication failed with status: ${response.status}`;
        dispatch(addError(errorMsg));
        // dispatch(addToast({ message: errorMsg, type: "error" }));
        // Optional: setIsLoading(false);
        return;
      }

      if (resData.token) {
        dispatch(addToast("Authentication successful!"));
        // Token is valid, user is authenticated
        sessionStorage.setItem("expirableToken", resData.token+"~expireAt~"+FiveDaysFromNow);
        navigate("/admin/dashboard");
      } else {
        // This case might be redundant if the !response.ok check catches it
        const errorMsg = resData.message || "Authentication failed: Invalid token.";
        dispatch(addError(errorMsg));
      }
    } catch (err) {
      const errorMsg = "Connection error! Please retry in a minute.";
      dispatch(addError(errorMsg));
      // Log the actual error for debugging
      console.error("Authentication fetch/processing error:", err);
    } finally {
      // Optional: setIsLoading(false);
    }
  };

  return { authenticateUser /*, isLoading */ };
};

export default useAuth; 