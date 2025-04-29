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
  disabled?: boolean;
  mode?: ButtonMode | undefined;
  type?: "submit" | "reset" | "button";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
};

export const Button = ({
  disabled = false,
  mode,
  type = "button",
  onClick,
  children,
}: ButtonProps) => {
  let className;
  const transitionClassNames = "transition-transform duration-300 ease-in-out";
  const hoverClassNames = "hover:shadow-xl cursor-pointer";
  const fontWeightClassNames = "font-bold";
  const roundedClassNames = "rounded";
  switch (mode) {
    case ButtonModes.PRIMARY:
      className = `bg-gray-600  hover:bg-gray-800 text-white ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    case ButtonModes.SECONDARY:
      className = `bg-gray-200 hover:bg-gray-300 text-gray-800 ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    case ButtonModes.DELETE:
      className = `bg-red-600 hover:bg-red-800 text-white ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
    default:
      className = `bg-white hover:bg-gray-200 text-gray-800 ${transitionClassNames} ${hoverClassNames} ${fontWeightClassNames} ${roundedClassNames}`;
      break;
  }
  return (
    <RippleButton
      type={type}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {children}
    </RippleButton>
  );
};
