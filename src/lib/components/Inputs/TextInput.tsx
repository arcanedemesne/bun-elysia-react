import React, { ChangeEventHandler, useRef } from "react";

import { CloseButton, ErrorMessage, InputProps, Label } from "@/lib/components";

interface TextInputProps extends InputProps {
  autoComplete?: string;
  errors?: string[] | undefined;
  ref?: React.Ref<HTMLInputElement> | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  onClear?: () => void;
}

export const TextInput = ({
  label,
  name,
  placeholder,
  type,
  value,
  className,
  autoComplete = "off",
  errors,
  ref,
  onChange,
  onClear,
}: TextInputProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  const normalClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-800";
  const errorClassName =
    "w-full rounded-md border px-4 py-2 shadow-sm border-red-500 focus:outline-none focus:ring-1 focus:ring-red-800";
  const finalClassName = `${className ? className + " " : ""}${error ? errorClassName : normalClassName}${value ? " pr-8" : ""}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onClear && onClear();
  };

  return (
    <>
      {label && (
        <Label htmlFor={name} hasError={!!error}>
          {label}
        </Label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={finalClassName}
        autoComplete={autoComplete}
        ref={ref}
      />
      {value && onClear && (
        <CloseButton className="right absolute top-0" onClick={handleClear} />
      )}
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};
