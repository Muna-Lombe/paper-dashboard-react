import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import { addToast } from "variables/slices/toastSlice";
import PageHeader from "../components/admin/PageHeader";

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
      const response = await api.get(endpoints.assistant.tools?.url);
      setTools(response.data.tools);
      if (response.data.tools?.length > 0) {
        setSelectedTool(response.data.tools[0].id);
      }
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to fetch assistant tools.")
      );
    }
  };

  const handleProcessData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setProcessingResult(null);
    try {
      const response = await api.post(endpoints.assistant.process.url, {
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
    <div className="pd-page">
      <PageHeader
        title="Teacher Assistant"
        description="Run assistant tools on text or structured input and review the result."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="pd-panel p-4 sm:p-5">
          <h2 className="pd-display text-lg font-bold">
            Process data
          </h2>
          <form onSubmit={handleProcessData} className="mt-4 space-y-4">
            <div>
              <label htmlFor="toolSelect" className="pd-label">
                Select tool
              </label>
              <select
                id="toolSelect"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="pd-input"
              >
                {tools?.length === 0 ? (
                  <option value="" disabled>
                    No tools available
                  </option>
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
              <label htmlFor="inputData" className="pd-label">
                Input data
              </label>
              <textarea
                id="inputData"
                rows="8"
                placeholder="Enter data to process..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="pd-input resize-y"
                required
              />
            </div>
            <button
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={isLoading || tools?.length === 0}
            >
              {isLoading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                  Processing…
                </>
              ) : (
                "Process Data"
              )}
            </button>
          </form>
        </section>

        <section className="pd-panel p-4 sm:p-5">
          <h2 className="pd-display text-lg font-bold">
            Result
          </h2>
          {processingResult ? (
            <pre className="mt-4 max-h-[28rem] overflow-auto rounded-[10px] border border-[var(--pd-border)] bg-[color-mix(in_srgb,var(--pd-canvas-end)_85%,white)] p-4 font-mono text-xs leading-relaxed text-[var(--pd-ink)] sm:text-sm">
              {JSON.stringify(processingResult, null, 2)}
            </pre>
          ) : (
            <p className="mt-8 text-center text-sm text-[var(--pd-muted)]">
              Processed output will appear here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default TeacherAssistant;
