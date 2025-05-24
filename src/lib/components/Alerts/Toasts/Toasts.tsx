import React, { ReactNode } from "react";

import { toastEventListenerName } from "@/lib/services";
import { Alert, ToastPosition } from "@/lib/types";

import { useAlerts } from "..";
import { AnimatedAlert } from "../AnimatedAlert";

export const Toasts = () => {
  const { alerts, onRemove } = useAlerts(toastEventListenerName);

  const positionedMap = new Map<ToastPosition, Alert[]>();
  const setFilteredAlerts = (toastPosition: ToastPosition) => {
    positionedMap.set(
      toastPosition,
      alerts.filter((x) => x.position === toastPosition),
    );
  };

  setFilteredAlerts("top-left");
  setFilteredAlerts("top-center");
  setFilteredAlerts("top-right");
  setFilteredAlerts("bottom-left");
  setFilteredAlerts("bottom-center");
  setFilteredAlerts("bottom-right");

  const getPosition = (toastPosition: ToastPosition) => {
    let positionClasses = "";
    switch (toastPosition) {
      case "top-left":
        positionClasses = "top-4 left-4";
        break;
      case "top-center":
        positionClasses = "top-4 left-1/2 transform -translate-x-1/2";
        break;
      case "top-right":
        positionClasses = "top-4 right-4";
        break;
      case "bottom-left":
        positionClasses = "bottom-4 left-4";
        break;
      case "bottom-center":
        positionClasses = "bottom-4 left-1/2 transform -translate-x-1/2";
        break;
      case "bottom-right":
      default:
        positionClasses = "bottom-4 right-4";
        break;
    }
    return positionClasses;
  };

  const components: ReactNode[] = [];
  positionedMap.forEach((alerts, toastPosition) => {
    if (alerts.length > 0) {
      components.push(
        <div
          key={toastPosition}
          className={`pointer-events-auto fixed z-50 flex flex-col ${getPosition(toastPosition)}`}
        >
          {alerts.map((alert) => {
            return <AnimatedAlert key={alert.id!} {...alert} duration={10 * 1000} onClose={onRemove} />;
          })}
        </div>,
      );
    }
  });

  return <>{components}</>;
};
