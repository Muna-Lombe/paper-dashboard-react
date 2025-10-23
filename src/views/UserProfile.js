import React, { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useDispatch } from "react-redux";
import { addError} from "../variables/slices/errorSlice"; // Assuming addSuccess is available or create it
import { endpoints } from "../config";
import { addToast } from "variables/slices/toastSlice";

function UserProfile() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    // Add other profile fields as needed
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(endpoints.user.profile.get.url);
      setProfile(response.data.user);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch user profile."));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(endpoints.user.profile.update.url, profile);
      dispatch(addToast(response.data.message || "Profile updated successfully!"));
      setIsEditingProfile(false);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update profile."));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      dispatch(addError("New passwords do not match."));
      return;
    }
    try {
      const response = await axios.put(endpoints.user.password.update.url, { newPassword });
      dispatch(addToast(response.data.message || "Password changed successfully!"));
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangingPassword(false);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to change password."));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await axios.delete(endpoints.user.profile.delete.url);
        dispatch(addToast(response.data.message || "Account deleted successfully."));
        // Redirect to login page after account deletion
        // navigate('/auth/login'); // Assuming you have navigate from react-router-dom
      } catch (error) {
        dispatch(addError(error.response?.data?.message || "Failed to delete account."));
      }
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">User Profile</h1>

      {/* Profile Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditingProfile}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
              value={profile.email}
              disabled
            />
          </div>
          {/* Add other profile fields here */}
          <div className="flex justify-end space-x-4 mt-6">
            {isEditingProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">New Password:</label>
            <input
              type="password"
              id="newPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!isChangingPassword}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmNewPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
            <input
              type="password"
              id="confirmNewPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={!isChangingPassword}
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            {isChangingPassword ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Change Password
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Change Password
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-gray-700 mb-4">Permanently delete your account and all associated data.</p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
