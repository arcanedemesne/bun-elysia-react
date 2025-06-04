import React, { ReactNode } from "react";

type LabelProps = {
  htmlFor: string;
  hasError?: boolean | "" | undefined;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

export const Label = ({ htmlFor, hasError, className = "mb-2 font-bold", onClick, children }: LabelProps) => (
  <label
    htmlFor={htmlFor}
    className={`${className} block text-sm text-${hasError ? "red" : "gray"}-600`}
    onClick={onClick}
  >
    {children}
  </label>
);
