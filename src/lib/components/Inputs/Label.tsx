import React, { ReactNode } from "react";

type LabelProps = {
  htmlFor: string;
  hasError?: boolean | "" | undefined;
  children: ReactNode;
};

export const Label = ({ htmlFor, hasError, children }: LabelProps) => (
  <label htmlFor={htmlFor} className={`mb-2 block text-sm font-bold text-${hasError ? "red" : "gray"}-600`}>
    {children}
  </label>
);
