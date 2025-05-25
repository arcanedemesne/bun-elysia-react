import React from "react";

import { MaximizeIcon } from "@/lib/components";

type MaximizeIconButtonProps = {
  color?: string;
  className?: string;
  onClick: () => void;
};
export const MaximizeIconButton = ({ color = "gray", className, onClick }: MaximizeIconButtonProps) => (
  <button
    className={`cursor-pointer ${className} right-2 top-2 text-${color}-500 hover:text-${color}-700 focus:outline-none`}
    onClick={onClick}
  >
    <MaximizeIcon />
  </button>
);
