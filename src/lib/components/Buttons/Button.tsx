import React, { MouseEvent, ReactNode } from "react";

export enum ButtonModes {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DELETE = "delete",
}
type ButtonMode = ButtonModes.PRIMARY | ButtonModes.SECONDARY | ButtonModes.DELETE;
type ButtonProps = {
  capitalize?: boolean;
  disabled?: boolean;
  mode?: ButtonMode | undefined;
  type?: "submit" | "reset" | "button";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
};

export const Button = ({
  capitalize = true,
  disabled = false,
  mode,
  type = "button",
  onClick,
  children,
}: ButtonProps) => {
  let theme;
  const transitionClassNames = "transition-transform duration-300 ease-in-out";
  const hoverClassNames = !disabled && "hover:shadow-xl cursor-pointer";
  const fontWeightClassNames = "font-bold";
  const roundedClassNames = "rounded-md";

  switch (mode) {
    case ButtonModes.PRIMARY:
      theme = `${disabled ? "bg-gray-200" : "bg-gray-600"} ${!disabled && "hover:bg-gray-800"} ${disabled ? "text-gray-400" : "text-white"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    case ButtonModes.SECONDARY:
      theme = `${disabled ? "bg-white" : "bg-gray-200"} ${!disabled && "hover:bg-gray-300"}  ${disabled ? "text-gray-200" : "text-gray-800"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    case ButtonModes.DELETE:
      theme = `${disabled ? "bg-red-200" : "bg-red-600"} ${!disabled && "hover:bg-red-800"} text-white ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    default:
      theme = `${disabled ? "bg-gray-200" : "bg-white"} ${!disabled && "hover:bg-gray-200"}  ${disabled ? "text-gray-400" : "text-gray-800"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`relative z-10 h-full w-full rounded-md ${!disabled && "cursor-pointer"} border-none px-4 py-2 ${theme}`}
    >
      {typeof children === "string" && capitalize ? children.toString().toUpperCase() : children}
    </button>
  );
};
