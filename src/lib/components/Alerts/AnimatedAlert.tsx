import React, { useEffect, useState } from "react";

import { CloseIconButton } from "@/lib/components";
import { Alert, AlertType } from "@/lib/types";

interface AnimatedAlertProps extends Alert {
  duration?: number;
  onClose?: (id: string) => void;
}

export const getTheme = (type: AlertType) => {
  let theme = "";
  switch (type) {
    case "success":
      theme = "bg-green-200 text-green-800 border-1 border-green-800";
      break;
    case "error":
      theme = "bg-red-200 text-red-800 border-1 border-red-800";
      break;
    case "warning":
      theme = "bg-yellow-200 text-yellow-800 border-1 border-yellow-800";
      break;
    case "info":
    default:
      theme = "bg-gray-200 text-gray-800 border-1 border-gray-800";
      break;
  }
  return theme;
};

export const AnimatedAlert = ({ id, type = "info", message, duration = 0, onClose }: AnimatedAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!isVisible) {
        onClose && onClose(id!);
      }
    };

    const element = document.getElementById(`alert-${id}`);

    if (element) {
      element.addEventListener("transitionend", handleTransitionEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener("transitionend", handleTransitionEnd);
      }
    };
  }, [isVisible, onClose, id]);

  const getTransitionClasses = () => {
    if (isVisible) {
      return "opacity-100 transition-opacity duration-500";
    }
    return "opacity-0 transition-opacity duration-500";
  };

  return (
    <div
      id={`alert-${id}`}
      className={`mb-2 flex items-center justify-between rounded-md p-3 shadow-lg ${getTransitionClasses()} ${getTheme(type)}`}
      role="alert"
    >
      <p className="mr-2 font-semibold">{message}</p>
      {onClose && (
        <CloseIconButton
          onClick={() => {
            setIsVisible(false);
          }}
        />
      )}
    </div>
  );
};
