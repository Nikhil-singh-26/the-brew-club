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
            className={`pointer-events-auto flex items-start gap-3 rounded-[10px] border px-4 py-3 shadow-md transition-all duration-200 ${
              t.type === "success"
                ? "border-[#557A5C]/40 bg-[#FFFFFF] text-[#1E1D1A]"
                : t.type === "error"
                ? "border-[#B8544B]/40 bg-[#FFFFFF] text-[#1E1D1A]"
                : "border-[#DED8CE] bg-[#FFFFFF] text-[#1E1D1A]"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                t.type === "success"
                  ? "bg-[#557A5C]/10 text-[#557A5C]"
                  : t.type === "error"
                  ? "bg-[#B8544B]/10 text-[#B8544B]"
                  : "bg-[#F5E8E0] text-[#C86B3C]"
              }`}
            >
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "☕"}
            </span>
            <div className="flex-1 text-xs font-medium leading-relaxed text-[#1E1D1A]">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#6F6A60] hover:text-[#1E1D1A] text-xs transition-colors ml-1 cursor-pointer"
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
