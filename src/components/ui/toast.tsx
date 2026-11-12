"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
  showToast: (toast: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// Global emitter fallback for non-React contexts if needed
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
const globalListeners = new Set<ToastListener>();

export const notify = {
  success: (title: string, message?: string, duration = 4500) => {
    globalListeners.forEach((fn) => fn({ type: "success", title, message, duration }));
  },
  error: (title: string, message?: string, duration = 5500) => {
    globalListeners.forEach((fn) => fn({ type: "error", title, message, duration }));
  },
  info: (title: string, message?: string, duration = 4500) => {
    globalListeners.forEach((fn) => fn({ type: "info", title, message, duration }));
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  // Connect global notify helper to provider
  React.useEffect(() => {
    const listener: ToastListener = (t) => showToast(t);
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, [showToast]);

  const toast = React.useMemo(
    () => ({
      success: (title: string, message?: string, duration = 4500) =>
        showToast({ type: "success", title, message, duration }),
      error: (title: string, message?: string, duration = 5500) =>
        showToast({ type: "error", title, message, duration }),
      info: (title: string, message?: string, duration = 4500) =>
        showToast({ type: "info", title, message, duration }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}

      {/* Floating Notifications Container */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed top-5 inset-x-0 sm:top-6 sm:right-6 sm:left-auto sm:max-w-md z-[200] pointer-events-none px-4 sm:px-0 flex flex-col items-center sm:items-end gap-2.5"
      >
        <AnimatePresence mode="sync">
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="pointer-events-auto w-full max-w-sm sm:max-w-md"
            >
              <div
                role={item.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`
                  relative overflow-hidden rounded-2xl p-4 sm:p-4.5 shadow-[0_12px_36px_-6px_rgba(41,35,34,0.18)]
                  backdrop-blur-xl border transition-all duration-200
                  ${
                    item.type === "success"
                      ? "bg-[#FFFDF9]/96 border-[#D4AF37]/50 text-[#292322]"
                      : item.type === "error"
                      ? "bg-[#FFF8F8]/96 border-[#A52232]/40 text-[#292322]"
                      : "bg-[#FFFCF6]/96 border-[#B8975E]/30 text-[#292322]"
                  }
                `}
              >
                {/* Subtle top decorative filigree sheen */}
                <div
                  className={`absolute top-0 inset-x-0 h-[2px] ${
                    item.type === "success"
                      ? "bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                      : item.type === "error"
                      ? "bg-gradient-to-r from-transparent via-[#A52232] to-transparent"
                      : "bg-gradient-to-r from-transparent via-[#B8975E] to-transparent"
                  }`}
                  aria-hidden="true"
                />

                <div className="flex items-start gap-3">
                  {/* Icon Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 shadow-2xs ${
                      item.type === "success"
                        ? "bg-[#1E7D4E]/10 border border-[#1E7D4E]/30 text-[#1E7D4E]"
                        : item.type === "error"
                        ? "bg-[#A52232]/10 border border-[#A52232]/30 text-[#A52232]"
                        : "bg-[#B8975E]/10 border border-[#B8975E]/30 text-[#8E6D38]"
                    }`}
                  >
                    {item.type === "success" && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {item.type === "error" && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {item.type === "info" && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h5
                      className={`font-serif text-sm sm:text-base font-medium leading-snug ${
                        item.type === "error" ? "text-[#7D1525]" : "text-[#292322]"
                      }`}
                    >
                      {item.title}
                    </h5>
                    {item.message && (
                      <p className="mt-0.5 text-xs text-[#5C5452] font-sans leading-relaxed">
                        {item.message}
                      </p>
                    )}
                  </div>

                  {/* Close Dismiss Button */}
                  <button
                    type="button"
                    onClick={() => dismissToast(item.id)}
                    className="shrink-0 p-1 rounded-lg text-[#8A8280] hover:text-[#292322] hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Dismiss notification"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
