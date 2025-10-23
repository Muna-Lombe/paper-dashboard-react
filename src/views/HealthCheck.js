import React, { useState, useEffect } from "react";

function HealthCheck() {
  const [services, setServices] = useState([
    { name: "API Server", status: "loading", latency: null },
    { name: "Database", status: "loading", latency: null },
    { name: "WebSocket Server", status: "loading", latency: null },
    { name: "Authentication Service", status: "loading", latency: null },
  ]);

  useEffect(() => {
    // Simulate API calls for health checks
    const checkService = (serviceName, minLatency, maxLatency) => {
      return new Promise((resolve) => {
        const latency = Math.floor(Math.random() * (maxLatency - minLatency + 1)) + minLatency;
        const status = latency < 100 ? "healthy" : (latency < 300 ? "degraded" : "unhealthy");
        setTimeout(() => {
          resolve({ name: serviceName, status, latency });
        }, Math.random() * 1500 + 500); // Simulate network delay
      });
    };

    const runHealthChecks = async () => {
      const results = await Promise.all([
        checkService("API Server", 50, 200),
        checkService("Database", 30, 150),
        checkService("WebSocket Server", 20, 100),
        checkService("Authentication Service", 60, 250),
      ]);

      setServices(prevServices =>
        prevServices.map(prevService => {
          const result = results.find(r => r.name === prevService.name);
          return result ? result : prevService;
        })
      );
    };

    runHealthChecks();
    const interval = setInterval(runHealthChecks, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "unhealthy":
        return "bg-red-500";
      case "loading":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return "fas fa-check-circle";
      case "degraded":
        return "fas fa-exclamation-triangle";
      case "unhealthy":
        return "fas fa-times-circle";
      case "loading":
        return "fas fa-spinner animate-spin";
      default:
        return "fas fa-question-circle";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">System Health Check</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {services.map((service) => (
          <div key={service.name} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(service.status)}`}>
              <i className={`${getStatusIcon(service.status)} text-white text-xl`}></i>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{service.name}</h2>
              <p className="text-gray-600 capitalize">Status: {service.status}</p>
              {service.latency !== null && (
                <p className="text-gray-600">Latency: {service.latency}ms</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HealthCheck;
