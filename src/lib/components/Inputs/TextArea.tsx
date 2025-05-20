import React, { ChangeEventHandler } from "react";

import { ErrorMessage, InputProps, Label } from "@/lib/components";

interface TextAreaProps extends Omit<InputProps, "type"> {
  errors?: string[] | undefined;
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined;
}

export const TextArea = ({
  label,
  name,
  placeholder,
  value,
  className,
  errors,
  onChange,
}: TextAreaProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  const normalClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-800";
  const errorClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-red-500 focus:outline-none focus:ring-1 focus:ring-red-800";
  const finalClassName = `${className ? className + " " : ""}${error ? errorClassName : normalClassName}${value ? " pr-8" : ""}`;

  return (
    <>
      {label && (
        <Label htmlFor={name} hasError={!!error}>
          {label}
        </Label>
      )}
      <textarea
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={finalClassName}
      />
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};
