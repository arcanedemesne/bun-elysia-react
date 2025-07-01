import React, { ReactNode } from "react";

export const AuthLayout = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 rounded bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-600">{title}</h1>
        {children}
      </div>
    </div>
  );
};
