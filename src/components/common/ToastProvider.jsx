import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "../../context/ToastContext.js";

let toastIndex = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, timeout = 3800) => {
      const id = `${Date.now()}-${toastIndex}`;
      toastIndex += 1;

      setToasts((prev) => [...prev, { id, type, message }]);

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          removeToast(id);
        }, timeout);
      }

      return id;
    },
    [removeToast],
  );

  const value = useMemo(
    () => ({
      success: (message, timeout) => addToast("success", message, timeout),
      error: (message, timeout) => addToast("error", message, timeout),
      info: (message, timeout) => addToast("info", message, timeout),
      removeToast,
    }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-zone" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <p>{toast.message}</p>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
