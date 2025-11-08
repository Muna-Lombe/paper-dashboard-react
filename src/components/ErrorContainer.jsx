import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeError } from "../variables/slices/errorSlice";

/**
 * ErrorContainer - Displays error notifications from Redux state
 * 
 * Reads from Redux store.errors and renders error cards
 * Positioned fixed at top-right corner, below ToastContainer
 */
function ErrorContainer() {
  const errors = useSelector((state) => state.errors?.errors || []);
  const dispatch = useDispatch();
  const [closingIds, setClosingIds] = useState([]);

  const handleClose = (errorId) => {
    setClosingIds([...closingIds, errorId]);
    setTimeout(() => {
      dispatch(removeError(errorId));
      setClosingIds(closingIds.filter((id) => id !== errorId));
    }, 300);
  };

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (errors.length > 0) {
      const timers = errors.map((error) => {
        if (!closingIds.includes(error.id)) {
          return setTimeout(() => {
            handleClose(error.id);
          }, 5000);
        }
        return null;
      });

      return () => {
        timers.forEach((timer) => {
          if (timer) clearTimeout(timer);
        });
      };
    }
  }, [errors, closingIds]);

  return (
    <div
      className="fixed top-4 right-4 z-40 flex flex-col gap-3 pointer-events-auto mt-[500px]"
      role="region"
      aria-label="Errors"
      aria-live="assertive"
      aria-atomic="false"
    >
      {errors.length > 0 ? (
        errors.map((error) => (
          <div
            key={error.id}
            className={`
              bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-xl
              transform transition-all duration-300 ease-out
              ${closingIds.includes(error.id) ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0"}
            `}
            style={{
              animation: closingIds.includes(error.id) 
                ? "slideOut 0.3s ease-out" 
                : "slideIn 0.3s ease-out",
            }}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 pt-0.5">
                <i className="fas fa-exclamation-circle text-red-500 text-lg"></i>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded">
                    Error
                  </span>
                </div>
                <p className="text-sm text-red-800 break-words">
                  {error.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => handleClose(error.id)}
                className="flex-shrink-0 ml-2 p-1 rounded hover:bg-white/50 transition-colors duration-200 text-red-500 hover:opacity-70"
                aria-label="Close error"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        ))
      ) : null}

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
    </div>
  );
}

export default ErrorContainer;

