export type ValueType = string | number | readonly string[] | undefined;

export type InputProps = {
  label?: string;
  name: string;
  placeholder?: string;
  type: "hidden" | "text" | "textarea" | "password" | "select";
  value?: ValueType;
  className?: string;
  autoComplete?: string;
};

export * from "./DropDownInput";
export * from "./HiddenInput";
export * from "./Label";
export * from "./TextArea";
export * from "./TextInput";
export * from "./TypeAheadInput";
