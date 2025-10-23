import React, { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import { addToast } from "variables/slices/toastSlice";

function TeacherAssistant() {
  const dispatch = useDispatch();
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [inputData, setInputData] = useState("");
  const [processingResult, setProcessingResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await axios.get(endpoints.assistant.tools?.url);
      setTools(response.data.tools);
      if (response.data.tools?.length > 0) {
        setSelectedTool(response.data.tools[0].id); // Select the first tool by default
      }
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to fetch assistant tools?."));
    }
  };

  const handleProcessData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProcessingResult(null);
    try {
      const response = await axios.post(endpoints.assistant.process.url, {
        toolId: selectedTool,
        data: inputData,
      });
      setProcessingResult(response.data.result);
      dispatch(addToast(response.data.message || "Data processed successfully!"));
    } catch (error) {
      dispatch(addError(error.response?.data?.message || "Failed to process data."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Teacher Assistant</h1>

      {/* Tools and Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Process Data with Tools</h2>
        <form onSubmit={handleProcessData} className="space-y-4">
          <div>
            <label htmlFor="toolSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Tool:</label>
            <select
              id="toolSelect"
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {tools?.length === 0 ? (
                <option value="" className="h-3.5 w-3.5 text-gray-500 " disabled>No tools available</option>
              ) : (
                tools?.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label htmlFor="inputData" className="block text-gray-700 text-sm font-bold mb-2">Input Data:</label>
            <textarea
              id="inputData"
              rows="6"
              placeholder="Enter data to process..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading || tools?.length === 0}
          >
            {isLoading ? "Processing..." : "Process Data"}
          </button>
        </form>
      </div>

      {/* Processing Result Section */}
      {processingResult && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Result</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-gray-800">
            {JSON.stringify(processingResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default TeacherAssistant;
