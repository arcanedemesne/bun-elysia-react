import React from "react";
import { CloseButton } from "../..";

type AlertBarProps = {
  id: string;
  message: string;
  onRemove: (id: string) => void;
};

export const AlertBar = ({ id, message, onRemove }: AlertBarProps) => {
  return (
    <div className="left-0 top-0 z-50 flex w-full items-center justify-between bg-red-800 p-4 text-white">
      <p>{message}</p>
      <CloseButton color="white" onClick={() => onRemove(id)} />
    </div>
  );
};
