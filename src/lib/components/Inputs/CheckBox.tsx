import React, { ChangeEventHandler, useRef } from "react";

import { ErrorMessage, InputProps, Label } from "@/lib/components";

interface CheckBoxProps extends Omit<InputProps, "type" | "value"> {
  checked: boolean;
  labelPosition?: "north" | "east" | "south" | "west";
  errors?: string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}

export const CheckBox = ({
  label,
  name,
  checked,
  labelPosition = "east",
  className,
  errors,
  onChange,
}: CheckBoxProps) => {
  const error = errors?.map((e) => <p key={e}>{e}</p>);

  let containerClassName;
  let labelClassName;

  switch (labelPosition) {
    case "north":
      containerClassName = "flex flex-col-reverse items-center";
      labelClassName = "mb-2";
      break;
    case "east":
      containerClassName = "inline-flex items-center";
      labelClassName = "ml-2";
      break;
    case "south":
      containerClassName = "flex flex-col items-center";
      labelClassName = "mt-2";
      break;
    case "west":
      containerClassName = "inline-flex items-center flex-row-reverse";
      labelClassName = "mr-2";
      break;
    default:
      break;
  }

  const defaultClassName = "rounded-full w-5 h-5 accent-gray-600 hover:accent-gray-800 cursor-pointer";
  const errorClassName = "rounded-full w-5 h-5 accent-red-600 hover:accent-red-800 cursor-pointer";
  const finalClassName = `${className ? className + " " : ""}${error ? errorClassName : defaultClassName}`;

  const checkBoxRef = useRef(null);

  return (
    <>
      <div className={containerClassName}>
        <input
          ref={checkBoxRef}
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={finalClassName}
        />
        {label && (
          <Label htmlFor={name} hasError={!!error} className={labelClassName}>
            {label}
          </Label>
        )}
      </div>
      {!!error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
};
