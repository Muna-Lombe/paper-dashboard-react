import React, { useEffect, useState } from "react";

/**
 * Toast Component - Individual notification card
 *
 * Props:
 * - id: unique identifier
 * - message: notification message text
 * - type: 'success' | 'error' | 'info' | 'warning'
 * - onClose: callback to dismiss
 * - autoClose: auto dismiss time in ms (default: 3000)
 */
function Toast({ id, message, type = "info", onClose, autoClose = 3000 }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  // Color and icon mapping based on type
  const typeConfig = {
    success: {
      bg: "bg-green-50",
      border: "border-l-4 border-green-500",
      text: "text-green-800",
      icon: "fas fa-check-circle text-green-500",
      badge: "bg-green-100 text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-l-4 border-red-500",
      text: "text-red-800",
      icon: "fas fa-times-circle text-red-500",
      badge: "bg-red-100 text-red-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-l-4 border-yellow-500",
      text: "text-yellow-800",
      icon: "fas fa-exclamation-circle text-yellow-500",
      badge: "bg-yellow-100 text-yellow-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-l-4 border-blue-500",
      text: "text-blue-800",
      icon: "fas fa-info-circle text-blue-500",
      badge: "bg-blue-100 text-blue-800",
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const typeLabel =
    type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div
      className={`
        ${config.bg} ${config.border} p-4 rounded-lg shadow-xl
        transform transition-all duration-300 ease-out
        ${isClosing ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0"}
        animate-slideIn
      `}
      style={{
        animation: isClosing ? "slideOut 0.3s ease-out" : "slideIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(400px);
          }
        }
      `}</style>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <i className={`${config.icon} text-lg`}></i>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${config.badge} px-2 py-1 rounded`}>
              {typeLabel}
            </span>
          </div>
          <p className={`text-sm ${config.text} break-words`}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 ml-2 p-1 rounded hover:bg-white/50
            transition-colors duration-200
            ${config.text} hover:opacity-70
          `}
          aria-label="Close notification"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>
    </div>
  );
}

export default Toast;

