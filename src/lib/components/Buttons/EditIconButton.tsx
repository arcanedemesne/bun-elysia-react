import React from "react";

import { EditIcon } from "@/lib/components";

type EditIconButtonProps = {
  onClick: () => void;
};

export const EditIconButton = ({ onClick }: EditIconButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <EditIcon />
    </button>
  );
};
