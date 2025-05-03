import React from "react";

import { EditIcon } from "@/components";

type EditButtonProps = {
  onClick: () => void;
};

export const EditButton = ({ onClick }: EditButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <EditIcon />
    </button>
  );
};
