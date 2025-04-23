import React, { ReactNode } from "react";

export const CardBase = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="rounded-md bg-white p-4 shadow-md"
    >
      {children}
    </div>
  );
};
