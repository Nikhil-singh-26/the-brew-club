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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "border-emerald-500/30 bg-[#0f1d16]/95 text-emerald-200 shadow-emerald-950/40"
                : t.type === "error"
                ? "border-rose-500/30 bg-[#1d0f12]/95 text-rose-200 shadow-rose-950/40"
                : "border-amber-500/30 bg-[#1a160f]/95 text-amber-200 shadow-amber-950/40"
            }`}
          >
            <span className="text-lg">
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "☕"}
            </span>
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white transition-colors text-xs ml-1"
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
