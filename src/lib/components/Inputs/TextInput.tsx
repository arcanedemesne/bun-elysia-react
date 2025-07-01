import React, { ChangeEventHandler, useRef } from "react";

import {
  CloseIconButton,
  ErrorMessage,
  InputProps,
  Label,
  textInputDefaultClassName,
  textInputErrorClassName,
} from "@/lib/components";

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
  onFocus,
  onClear,
}: TextInputProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  const finalClassName = `${className ? className + " " : ""}${error ? textInputErrorClassName : textInputDefaultClassName}${value ? " pr-8" : ""}`;
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
        onFocus={onFocus}
        placeholder={placeholder}
        className={finalClassName}
        autoComplete={autoComplete}
        ref={ref}
      />
      {value && onClear && <CloseIconButton className="right absolute top-0" onClick={handleClear} />}
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};
