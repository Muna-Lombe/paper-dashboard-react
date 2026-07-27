import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useDispatch } from "react-redux";
import { addError } from "../variables/slices/errorSlice";
import { endpoints } from "../config";
import Bot from "../components/Bot";
import { addToast } from "variables/slices/toastSlice";
import PageHeader from "../components/admin/PageHeader";

function Integrations() {
  const dispatch = useDispatch();
  const [integrations, setIntegrations] = useState([]);
  const [newIntegrationName, setNewIntegrationName] = useState("");

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get(endpoints.integrations?.get.url);
      setIntegrations(response.data.integrations);
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to fetch integrations.")
      );
    }
  };

  const handleAddIntegration = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(endpoints.integrations?.add.url, {
        name: newIntegrationName,
      });
      dispatch(addToast(response.data.message || "Integration added successfully!"));
      setNewIntegrationName("");
      fetchIntegrations();
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to add integration.")
      );
    }
  };

  const handleUpdateIntegration = async (id, newName) => {
    try {
      const response = await api.put(endpoints.integrations?.update(id).url, {
        name: newName,
      });
      dispatch(addToast(response.data.message || "Integration updated successfully!"));
      fetchIntegrations();
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to update integration.")
      );
    }
  };

  const handleDeleteIntegration = async (id) => {
    try {
      const response = await api.delete(endpoints.integrations?.delete(id).url);
      dispatch(addToast(response.data.message || "Integration deleted successfully!"));
      fetchIntegrations();
    } catch (error) {
      dispatch(
        addError(error.response?.data?.message || "Failed to delete integration.")
      );
    }
  };

  return (
    <div className="pd-page">
      <PageHeader
        title="Integrations"
        description="Connect external services and manage Telegram access for scraping tools."
      />

      <div className="space-y-4">
        <section className="pd-panel p-4 sm:p-5">
          <h2 className="pd-display text-lg font-bold">
            Add integration
          </h2>
          <form
            onSubmit={handleAddIntegration}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              placeholder="Integration name"
              value={newIntegrationName}
              onChange={(e) => setNewIntegrationName(e.target.value)}
              className="pd-input"
              required
            />
            <button type="submit" className="pd-btn pd-btn-primary shrink-0">
              Add Integration
            </button>
          </form>
        </section>

        <section className="pd-panel p-4 sm:p-5">
          <h2 className="pd-display text-lg font-bold">
            My integrations
          </h2>
          {integrations?.length === 0 ? (
            <p className="mt-6 text-center text-sm text-[var(--pd-muted)]">
              No integrations added yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {integrations?.map((integration) => (
                <li
                  key={integration.id}
                  className="flex flex-col gap-3 rounded-[10px] border border-[var(--pd-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-[var(--pd-ink)]">
                    {integration.name}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateIntegration(
                          integration.id,
                          prompt("New name:", integration.name)
                        )
                      }
                      className="pd-btn pd-btn-warn"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      className="pd-btn pd-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pd-panel p-4 sm:p-5">
          <h2 className="pd-display text-lg font-bold">
            Telegram Bot
          </h2>
          <p className="mt-1 text-sm text-[var(--pd-muted)]">
            Manage your Telegram bot connection for scraper access and related features.
          </p>
          <div className="mt-4">
            <Bot />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Integrations;
