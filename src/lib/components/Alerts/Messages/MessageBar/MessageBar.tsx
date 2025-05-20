import React from "react";

import { CloseButton, getTheme } from "@/lib/components";
import { Alert } from "@/lib/types";

interface MessageBarProps extends Alert {
  onClose?: (id: string) => void;
}

export const MessageBar = ({
  id,
  message,
  type = "info",
  onClose,
}: MessageBarProps) => {
  return (
    <div
      className={`m-2 flex w-full items-center justify-between rounded-md p-3 ${getTheme(type)}`}
    >
      <p className="font-semibold">{message}</p>
      {onClose && <CloseButton onClick={() => onClose(id!)} />}
    </div>
  );
};
