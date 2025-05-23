import React from "react";

import { InputProps } from "@/lib/components";

interface HiddenInputProps extends InputProps {}

export const HiddenInput = ({ name, type, value }: HiddenInputProps) => {
  return <input type={type} id={name} name={name} value={value ?? ""} />;
};
