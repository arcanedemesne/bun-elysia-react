import React, { ReactNode } from "react";

export const CardBase = ({ children }: { children: ReactNode }) => {
  return <div className="rounded-md bg-white px-4 py-3 shadow-md">{children}</div>;
};
