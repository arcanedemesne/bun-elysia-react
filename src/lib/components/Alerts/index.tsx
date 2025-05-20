import { AlertType } from "@/lib/types";

export * from "./hooks";
export * from "./Messages";
export * from "./Toasts";

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
