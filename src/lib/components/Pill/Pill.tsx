import React from "react";

import { CloseIconButton } from "@/lib/components";

type PillProps = {
  value: string;
  onRemove: () => void;
};

export const Pill = ({ value, onRemove }: PillProps) => (
  <div className="mr-2 inline-flex items-center rounded-lg bg-gray-200 py-1 pl-3 pr-1 text-sm text-gray-800">
    <span>{value}</span>
    <CloseIconButton className="right-0 scale-75" onClick={onRemove} />
  </div>
);
