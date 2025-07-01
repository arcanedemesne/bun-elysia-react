import React, { ReactNode } from "react";

export const PageLayout = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full rounded bg-white p-8 shadow-md">
        <h1 className="mb-4 text-left text-2xl font-bold text-gray-600">{title}</h1>
        {children}
      </div>
    </div>
  );
};
