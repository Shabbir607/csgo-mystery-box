import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

const getStyle = (type: string) => {
  switch (type) {
    case "success":
      return "bg-gradient-to-r from-green-500 to-green-600 shadow-green-400/40";
    case "error":
      return "bg-gradient-to-r from-red-500 to-red-600 shadow-red-400/40";
    case "info":
    default:
      return "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-400/40";
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`min-w-[250px] max-w-sm px-4 py-3 rounded-xl text-white font-medium text-sm shadow-xl border border-white/10 animate-fade-in-down backdrop-blur-md ${getStyle(
        type
      )}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-300 transition text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
};
