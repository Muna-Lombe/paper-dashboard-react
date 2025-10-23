import React, { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useDispatch } from "react-redux";
import { addError} from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import Bot from "../components/Bot"; // Assuming Bot component is for Telegram integration
import { addToast } from "variables/slices/toastSlice";

function Integrations() {
  const dispatch = useDispatch();
  const [integrations, setIntegrations] = useState([]);
  const [newIntegrationName, setNewIntegrationName] = useState("");

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(endpoints.integrations?.get.url);
      setIntegrations(response.data.integrations);
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch integrations?."));
    }
  };

  const handleAddIntegration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(endpoints.integrations?.add.url, { name: newIntegrationName });
      dispatch(addToast(response.data.message || "Integration added successfully!"));
      setNewIntegrationName("");
      fetchIntegrations(); // Refresh list
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to add integration."));
    }
  };

  const handleUpdateIntegration = async (id, newName) => {
    try {
      const response = await axios.put(endpoints.integrations?.update(id).url, { name: newName });
      dispatch(addToast(response.data.message || "Integration updated successfully!"));
      fetchIntegrations(); // Refresh list
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to update integration."));
    }
  };

  const handleDeleteIntegration = async (id) => {
    try {
      const response = await axios.delete(endpoints.integrations?.delete(id).url);
      dispatch(addToast(response.data.message || "Integration deleted successfully!"));
      fetchIntegrations(); // Refresh list
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to delete integration."));
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Integrations</h1>

      {/* Add New Integration Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Integration</h2>
        <form onSubmit={handleAddIntegration} className="flex space-x-4">
          <input
            type="text"
            placeholder="Integration Name"
            value={newIntegrationName}
            onChange={(e) => setNewIntegrationName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-shrink-0"
          >
            Add Integration
          </button>
        </form>
      </div>

      {/* Existing Integrations List */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Integrations</h2>
        {integrations?.length === 0 ? (
          <p className="text-gray-600">No integrations added yet.</p>
        ) : (
          <ul className="space-y-4">
            {integrations?.map((integration) => (
              <li key={integration.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                <span className="text-lg font-medium text-gray-800">{integration.name}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdateIntegration(integration.id, prompt("New name:", integration.name))}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Specific Integration: Telegram Bot */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Telegram Bot Integration</h2>
        <p className="text-gray-700 mb-4">Manage your Telegram bot connection for scraper access and other functionalities.</p>
        <Bot /> {/* Render the Bot component here */}
      </div>
    </div>
  );
}

export default Integrations;