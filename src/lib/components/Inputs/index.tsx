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

export const textInputDefaultClassName =
  "w-full rounded-md border px-4 py-2 shadow-sm border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-800";
export const textInputErrorClassName =
  "w-full rounded-md border px-4 py-2 shadow-sm border-red-500 focus:outline-none focus:ring-1 focus:ring-red-800";

export * from "./CheckBox";
export * from "./DropDownInput";
export * from "./HiddenInput";
export * from "./Label";
export * from "./TextArea";
export * from "./TextInput";
export * from "./TypeAheadInput";
