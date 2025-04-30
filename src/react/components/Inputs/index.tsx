export type ValidationError = {
  name: string;
  message: string;
};

export type ValueType = string | number | readonly string[] | undefined;

export type InputProps = {
  label?: string;
  name: string;
  placeholder?: string;
  type: "hidden" | "text" | "password" | "select";
  value?: ValueType;
  autoComplete?: string;
};

export * from "./DropDownInput";
export * from "./HiddenInput";
export * from "./Label";
export * from "./TextInput";
export * from "./TypeAheadInput";
