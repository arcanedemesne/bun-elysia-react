import React, { ReactNode } from "react";

export const CardBase = ({ children }: { children: ReactNode }) => {
  return (
    <div className="rounded-md bg-white px-4 py-3 shadow-md hover:border hover:border-gray-400">
      {children}
    </div>
  );
};
