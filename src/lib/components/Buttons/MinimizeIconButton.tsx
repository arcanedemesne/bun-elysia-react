import React from "react";

import { MinimizeIcon } from "@/lib/components";

type MinimizeIconButtonProps = {
  color?: string;
  className?: string;
  onClick: () => void;
};
export const MinimizeIconButton = ({ color = "gray", className, onClick }: MinimizeIconButtonProps) => (
  <button
    className={`cursor-pointer ${className} right-2 top-2 text-${color}-500 hover:text-${color}-700 focus:outline-none`}
    onClick={onClick}
  >
    <MinimizeIcon />
  </button>
);
