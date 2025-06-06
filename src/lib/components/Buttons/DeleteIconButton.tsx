import React from "react";

import { TrashIcon } from "@/lib/components";

type DeleteIconButtonProps = {
  onClick: () => void;
};

export const DeleteIconButton = ({ onClick }: DeleteIconButtonProps) => {
  return (
    <button onClick={onClick} className="cursor-pointer text-red-500 hover:text-red-700 focus:outline-none">
      <TrashIcon />
    </button>
  );
};
