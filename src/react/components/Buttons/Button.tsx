import React, { ReactNode, MouseEvent } from "react";
import { RippleButton } from "./RippleButton";

export enum ButtonModes {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DELETE = "delete",
}
type ButtonMode =
  | ButtonModes.PRIMARY
  | ButtonModes.SECONDARY
  | ButtonModes.DELETE;
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
  let className;
  let rippleColor;
  const transitionClassNames = "transition-transform duration-300 ease-in-out";
  const hoverClassNames = !disabled && "hover:shadow-xl cursor-pointer";
  const fontWeightClassNames = "font-bold";
  const roundedClassNames = "rounded";

  switch (mode) {
    case ButtonModes.PRIMARY:
      className = `${disabled ? "bg-gray-200" : "bg-gray-600"} ${!disabled && "hover:bg-gray-800"} ${disabled ? "text-gray-400" : "text-white"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      rippleColor = "rgba(255, 255, 255, 1)";
      break;
    case ButtonModes.SECONDARY:
      className = `${disabled ? "bg-white" : "bg-gray-200"} ${!disabled && "hover:bg-gray-300"}  ${disabled ? "text-gray-200" : "text-gray-800"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      rippleColor = "rgba(30, 41, 59, 1)";
      break;
    case ButtonModes.DELETE:
      className = `${disabled ? "bg-red-200" : "bg-red-600"} ${!disabled && "hover:bg-red-800"} text-white ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      rippleColor = "rgba(255, 255, 255, 1)";
      break;
    default:
      className = `${disabled ? "bg-gray-200" : "bg-white"} ${!disabled && "hover:bg-gray-200"}  ${disabled ? "text-gray-400" : "text-gray-800"} ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      rippleColor = "rgba(30, 41, 59, 1)";
      break;
  }

  return (
    <RippleButton
      type={type}
      capitalize={capitalize}
      disabled={disabled}
      className={className}
      rippleColor={rippleColor}
      onClick={onClick}
    >
      {children}
    </RippleButton>
  );
};
