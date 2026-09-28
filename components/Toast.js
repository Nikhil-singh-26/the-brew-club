"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext({
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
  },
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastMethods = {
    success: (msg, opts) => addToast(msg, "success", opts?.autoClose || 4000),
    error: (msg, opts) => addToast(msg, "error", opts?.autoClose || 4000),
    info: (msg, opts) => addToast(msg, "info", opts?.autoClose || 4000),
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-[8px] border px-3.5 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200 ${
              t.type === "success"
                ? "border-[#7E9B72]/40 bg-[#201F1B] text-[#F4F0E8]"
                : t.type === "error"
                ? "border-[#C85C52]/40 bg-[#201F1B] text-[#F4F0E8]"
                : "border-[#34322C] bg-[#201F1B] text-[#F4F0E8]"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                t.type === "success"
                  ? "text-[#7E9B72]"
                  : t.type === "error"
                  ? "text-[#C85C52]"
                  : "text-[#C96F43]"
              }`}
            >
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "☕"}
            </span>
            <div className="flex-1 text-xs leading-relaxed text-[#F4F0E8]">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#77736B] hover:text-[#AAA59A] text-xs transition-colors ml-1 cursor-pointer"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (msg) => console.log("[Toast success]:", msg),
        error: (msg) => console.error("[Toast error]:", msg),
        info: (msg) => console.log("[Toast info]:", msg),
      },
    };
  }
  return context;
};

export default ToastProvider;
