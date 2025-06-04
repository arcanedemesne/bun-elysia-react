import React, { ChangeEventHandler, KeyboardEventHandler } from "react";

import { ErrorMessage, InputProps, Label, textInputDefaultClassName, textInputErrorClassName } from "@/lib/components";

interface TextAreaProps extends Omit<InputProps, "type"> {
  errors?: string[] | undefined;
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
}

export const TextArea = ({
  label,
  name,
  placeholder,
  value,
  className,
  errors,
  onChange,
  onKeyDown,
}: TextAreaProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  const finalClassName = `${className ? className + " " : ""}${error ? textInputErrorClassName : textInputDefaultClassName}${value ? " pr-8" : ""}`;

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
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={finalClassName}
      />
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};
