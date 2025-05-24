import { useEffect, useState } from "react";

import { Alert } from "@/lib/types";

export const useAlerts = (eventListenerName: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleAdd = (event: any) => {
    setAlerts((prev) => [...prev, { id: crypto.randomUUID(), ...event.detail }]);
  };

  const onRemove = (id: string) => {
    setAlerts(alerts.filter((e) => e.id !== id));
  };

  useEffect(() => {
    document.addEventListener(eventListenerName, handleAdd);
    return () => {
      document.removeEventListener(eventListenerName, handleAdd);
    };
  }, [eventListenerName]);

  return {
    alerts,
    onRemove,
  };
};
