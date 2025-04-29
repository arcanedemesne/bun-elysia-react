export type ValidationError = {
  name: string;
  message: string;
};

export type ValueType = string | number | readonly string[] | undefined;

export type InputProps = {
  label?: string;
  name: string;
  placeholder?: string;
  type: "text" | "hidden";
  value?: ValueType;
};

export * from "./HiddenInput";
export * from "./TextInput";
