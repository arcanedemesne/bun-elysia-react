import React from "react";
import { CloseIcon } from "..";

type CloseButtonProps = {
  color?: string;
  className?: string;
  onClick: () => void;
};
export const CloseButton = ({
  color = "gray",
  className,
  onClick,
}: CloseButtonProps) => (
  <button
    className={`${className} right-2 top-2 text-${color}-500 hover:text-${color}-700 cursor-pointer focus:outline-none`}
    onClick={onClick}
  >
    <CloseIcon />
  </button>
);
