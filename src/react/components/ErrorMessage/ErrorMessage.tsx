import React, { ReactNode } from "react";

export const ErrorMessage = ({
  children,
}: {
  children: string | ReactNode;
}) => {
  return (
    <>
      {children && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <span>{children}</span>
        </div>
      )}
    </>
  );
};
