import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;
import { endpoints } from "../config"; // Assuming config.js is in the parent directory
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import useAuth from "../variables/hooks/useAuth";

function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login, register} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isLogin) {
        response = await login(email, password);
        // console.log("Login successful:", response.data);
        if (response.success) {  
          navigate("/admin/dashboard")
          dispatch(addToast("Login successful!"));
        } else {
          dispatch(addError(response.message || "Login failed. Please try again."));
        }
      } else {
        if (password !== confirmPassword) {
          dispatch(addError("Passwords do not match."));
          return;
        }
        response = await register(email, password);
        // console.log("Login successful:", response.data);
        if (response.success) {  
          dispatch(addToast("Registration successful! Please log in."));
          setIsLogin(true)
        } else {
          dispatch(addError(response.message || "Registration failed. Please try again."));
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Handle 401 Unauthorized specifically
      if (error.response && error.response.status === 401) {
        dispatch(addError(error.response.data.message || "Unauthorized: Please check your credentials."));
      } else {
        dispatch(addError(error.response?.data?.message || "Authentication failed. Please try again."));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="w-full flex justify-center items-center space-x-2">
          {/* <img src="/path/to/logo.png" alt="Logo" className="h-8" /> Replace with actual logo path */}
          <Link to="/">
            <span className="text-2xl flex items-start font-bold text-gray-800">
              <span className="text-blue-400 text-xl"><i className="fas fa-info"></i></span>
              <span className="text-blue-600 text-3xl italic">Teach</span>
              
            </span>
          
          </Link>
          <span className="text-2xl flex items-start font-bold text-gray-800">|</span>
          <span className="text-2xl flex items-start font-bold text-gray-800">
            {isLogin ? "Login" : "Register"}
          </span>
        </div>
        <span className="w-full text-center text-xs flex items-center font-bold text-gray-400 italic">Craft your teaching experience</span>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-blue-600 hover:text-blue-500 ml-1 focus:outline-none focus:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthenticationPage;
