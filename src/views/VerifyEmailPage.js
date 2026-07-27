import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToast } from "../variables/slices/toastSlice";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import TextLogo from "../components/TextLogo";

/**
 * VerifyEmailPage - Handles email verification via token
 * 
 * URL Format:
 * /verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 * Token contains:
 * - email: user's email address
 * - purpose: "email_verification"
 * - iat: issued at timestamp
 * - exp: expiration timestamp
 */
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error', 'expired'
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const token = searchParams.get("token");

      // Validate token exists
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided. Please check your email link.");
        dispatch(
          addError("No verification token found. Please request a new verification link.")
        );
        setLoading(false);
        return;
      }

      // Call verification endpoint
      const response = await endpoints.auth.verifyEmail.post({ token });

      // Handle success
      if (response.data.success) {
        setStatus("success");
        setEmail(response.data.email || "");
        setMessage("Your email has been verified successfully!");
        dispatch(
          addToast({
            message: "Email verified successfully! Redirecting to login...",
            type: "success",
          })
        );

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(
          response.data.message || "Email verification failed. Please try again."
        );
        dispatch(addError(response.data.message || "Verification failed"));
        setLoading(false);
      }
    } catch (error) {
      console.error("Email verification error:", error);

      // Handle specific error cases
      const errorMessage = error.response?.data?.message || error.message;

      if (error.response?.status === 400) {
        // Bad request - likely expired token
        setStatus("expired");
        setMessage(
          "Your verification link has expired. Please request a new one."
        );
        dispatch(
          addError(
            "Verification link expired. Please request a new verification email."
          )
        );
      } else if (error.response?.status === 404) {
        // Not found - invalid token
        setStatus("error");
        setMessage("Invalid verification link. Please check your email.");
        dispatch(addError("Invalid verification token"));
      } else {
        setStatus("error");
        setMessage(errorMessage || "An error occurred during verification.");
        dispatch(addError(errorMessage || "Verification failed"));
      }

      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setStatus("verifying");
    verifyEmail();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/">
              <TextLogo className="h-16" />
            </Link>
          </div>

          {/* Status Icon and Title */}
          {status === "verifying" && loading && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="animate-spin">
                  <i className="fas fa-spinner text-indigo-600 text-4xl"></i>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <i className="fas fa-check-circle text-green-600 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              {email && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                  <p className="text-sm text-green-800">
                    Verified Email: <strong>{email}</strong>
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Redirecting to login in 2 seconds...
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <i className="fas fa-times-circle text-red-600 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Try Again
                </button>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
                >
                  Go to Login
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Didn't receive an email?{" "}
                <Link
                  to="/resend-verification"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Request a new link
                </Link>
              </p>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <i className="fas fa-hourglass-end text-yellow-600 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">
                Link Expired
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="space-y-3">
                <Link
                  to="/resend-verification"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-center"
                >
                  Request New Verification Link
                </Link>
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-center"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <Link to="/" className="text-indigo-600 hover:text-indigo-700">
                Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4 text-center text-sm text-gray-600">
          <p>
            <i className="fas fa-shield-alt text-green-600 mr-2"></i>
            Your email verification is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;

