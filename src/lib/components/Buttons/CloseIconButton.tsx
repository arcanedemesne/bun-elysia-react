import React from "react";

import { CloseIcon } from "@/lib/components";

type CloseIconButtonProps = {
  color?: string;
  className?: string;
  onClick: () => void;
};
export const CloseIconButton = ({ color = "gray", className, onClick }: CloseIconButtonProps) => (
  <button
    className={`cursor-pointer ${className} right-2 top-2 text-${color}-500 hover:text-${color}-700 focus:outline-none`}
    onClick={onClick}
  >
    <CloseIcon />
  </button>
);
