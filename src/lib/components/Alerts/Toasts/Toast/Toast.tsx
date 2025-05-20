import React from "react";

import { CloseButton, getTheme } from "@/lib/components";
import { Alert } from "@/lib/types";

interface ToastProps extends Alert {
  duration?: number;
  onClose?: (id: string) => void;
}

export const Toast = ({
  id,
  message,
  type = "info",
  duration = 10 * 1000,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.(id!);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`mb-2 flex items-center justify-between rounded-md p-3 shadow-lg ${getTheme(type)}`}
    >
      <p className="mr-2 font-semibold">{message}</p>
      {onClose && <CloseButton onClick={() => onClose(id!)} />}
    </div>
  );
};
