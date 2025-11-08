import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../variables/slices/toastSlice";
import Toast from "./Toast";

/**
 * ToastContainer - Displays all toast notifications from Redux state
 * 
 * Reads from Redux store.toasts and renders Toast components
 * Positioned fixed at top-right corner
 */
function ToastContainer() {
  const toasts = useSelector((state) => state.toasts.toasts || []);
  const dispatch = useDispatch();

  const handleClose = (id) => {
    dispatch(removeToast(id));
  };

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-auto"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.length > 0 ? (
        toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type || "info"}
            onClose={handleClose}
            autoClose={toast.autoClose || 3000}
          />
        ))
      ) : null}
    </div>
  );
}

export default ToastContainer;

