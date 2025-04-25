import React from "react";
import { TrashIcon } from "../Icons";

type DeleteButtonProps = {
  onDelete: () => void;
};

export const DeleteButton = ({ onDelete }: DeleteButtonProps) => {
  return (
    <button
      onClick={onDelete}
      className="cursor-pointer text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <TrashIcon />
    </button>
  );
};
