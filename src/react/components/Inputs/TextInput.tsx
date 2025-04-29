import React, { ChangeEventHandler } from "react";
import { InputProps, ValidationError } from ".";
import { ErrorMessage } from "..";

interface TextInputProps extends InputProps {
  error?: ValidationError | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}

export const TextInput = ({
  label,
  name,
  placeholder,
  type,
  value,
  error,
  onChange,
}: TextInputProps) => {
  const normalClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-800";
  const errorClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-red-500 focus:outline-none focus:ring-1 focus:ring-red-800";
  return (
    <>
      {label && (
        <label
          htmlFor={name}
          className={`mb-2 block text-sm font-bold text-${error ? "red" : "gray"}-600`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? errorClassName : normalClassName}
      />
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </>
  );
};
