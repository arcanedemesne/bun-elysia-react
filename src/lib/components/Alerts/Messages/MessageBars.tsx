import React from "react";

import { messageBarEventListenerName } from "@/lib/services";

import { useAlerts } from "..";
import { AnimatedAlert } from "../AnimatedAlert";

export const MessageBars = () => {
  const { alerts, onRemove } = useAlerts(messageBarEventListenerName);

  return (
    <div className="z-99 pointer-events-auto fixed w-full p-2">
      {alerts.map((alert) => {
        return <AnimatedAlert key={alert.id!} {...alert} id={alert.id!} onClose={onRemove} />;
      })}
    </div>
  );
};
