import { ReactNode } from "react";

export type Alert = {
  id?: string;
  message: ReactNode | string;
  type?: AlertType;
  position?: ToastPosition;
};

export type AlertType = "success" | "error" | "warning" | "info";
export type MessageBarPosition = "top" | "bottom";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
