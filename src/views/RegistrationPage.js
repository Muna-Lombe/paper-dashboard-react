import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;
import { endpoints } from "../config";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import useAuth from "../variables/hooks/useAuth";
import TextLogo from "../components/TextLogo";
import OnboardingForm from "../components/OnboardingForm";

function RegistrationPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register } = useAuth();

  const handleOnboardingComplete = (data) => {
    setOnboardingData(data);
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      dispatch(addError("Passwords do not match."));
      setLoading(false);
      return;
    }

    try {
      const response = await register(email, password);
      
      if (response.success) {
        // Optionally store onboarding data for later use
        if (onboardingData) {
          localStorage.setItem("userOnboarding", JSON.stringify(onboardingData));
        }
        
        dispatch(addError("Registration successful! Please log in."));
        navigate("/login");
      } else {
        dispatch(addError(response.message || "Registration failed. Please try again."));
      }
    } catch (error) {
      console.error("Registration error:", error);
      dispatch(
        addError(error.response?.data?.message || "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (showOnboarding) {
    return (
      <OnboardingForm
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="w-full flex justify-center items-center space-x-2 mb-4">
          <Link to="/">
            <TextLogo className="h-20" />
          </Link>
          <span className="h-full text-2xl flex items-start font-bold text-gray-600">
            |
          </span>
          <span className="text-2xl flex items-start font-bold text-gray-800">
            Register
          </span>
        </div>
        <span className="w-full text-center text-xs flex items-center font-bold text-gray-400 italic justify-center mb-6">
          Complete your signup
        </span>

        {onboardingData && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-800 font-medium">
              ✓ Welcome{onboardingData.fullName ? `, ${onboardingData.fullName}` : ""}!
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Your onboarding information is saved. Now let's create your account.
            </p>
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 ml-1"
          >
            Login
          </Link>
        </p>

        <button
          onClick={handleOnboardingSkip}
          className="w-full mt-4 text-center text-xs text-gray-400 hover:text-gray-600 transition underline"
        >
          Update onboarding information
        </button>
      </div>
    </div>
  );
}

export default RegistrationPage;
