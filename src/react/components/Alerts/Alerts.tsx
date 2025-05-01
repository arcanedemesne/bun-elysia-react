import React, { useEffect, useState } from "react";
import { ApiError } from "@/src/types";
import { AlertBar } from "./AlertBar";

type Alert = {
  id: string;
  message: string;
};

const eventListenerName = "alert-event-listener";

export const emitAlert = (apiError: ApiError) => {
  let detail: Alert = {
    id: crypto.randomUUID(),
    message: `(${apiError.status}) ${apiError.statusText} - ${apiError.message}`,
  };

  document.dispatchEvent(
    new CustomEvent(eventListenerName, {
      detail,
      bubbles: true, // Optional: Should the event bubble up the DOM tree? (default: false)
      cancelable: false, // Optional: Can the event's default action be prevented? (default: false)
    }),
  );
};

export const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleAdd = (event: any) => {
    setAlerts((prev) => [...prev, { ...event.detail }]);
  };

  const handleRemove = (id: string) => {
    setAlerts(alerts.filter((e) => e.id !== id));
  };

  useEffect(() => {
    document.addEventListener(eventListenerName, handleAdd);
    return () => {
      document.removeEventListener(eventListenerName, handleAdd);
    };
  }, []);

  return (
    <>
      {alerts.map((alert) => {
        return (
          <AlertBar
            key={alert.id}
            id={alert.id}
            message={alert.message}
            onRemove={handleRemove}
          />
        );
      })}
    </>
  );
};
