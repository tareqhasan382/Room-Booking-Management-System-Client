"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

const styles = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    bar: "bg-green-500",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    bar: "bg-red-500",
  },
  info: {
    icon: <Info className="w-5 h-5 text-sky-400" />,
    bar: "bg-sky-500",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (msg) => push(msg, "success"),
      error: (msg) => push(msg, "error"),
      info: (msg) => push(msg, "info"),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const s = styles[t.type] || styles.info;
          return (
            <div
              key={t.id}
              className="relative flex items-start gap-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-slate-200 dark:border-gray-700 px-4 py-3 animate-[toastIn_.3s_ease]"
            >
              <span className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${s.bar}`} />
              <span className="mt-0.5">{s.icon}</span>
              <p className="flex-1 text-sm text-gray-800 dark:text-gray-100 break-words">
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
