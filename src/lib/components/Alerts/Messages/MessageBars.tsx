import React from "react";

import { messageBarEventListenerName } from "@/lib/services";

import { useAlerts } from "..";
import { MessageBar } from "./MessageBar";

export const MessageBars = () => {
  const { alerts, onRemove } = useAlerts(messageBarEventListenerName);

  return (
    <div className="z-99 w-99/100 pointer-events-auto fixed">
      {alerts.map((alert) => {
        return (
          <MessageBar
            key={alert.id!}
            {...alert}
            id={alert.id!}
            onClose={onRemove}
          />
        );
      })}
    </div>
  );
};
