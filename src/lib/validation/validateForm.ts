import { z } from "zod";

export type ValidationResponse = {
  success: boolean;
  data: any;
  errors: FieldErrors | undefined;
};

export type FieldErrors = {
  [x: string]: string[] | undefined;
  [x: number]: string[] | undefined;
  [x: symbol]: string[] | undefined;
};

export const validateForm = <T>(
  formData: FormData,
  validationSchema: z.Schema,
): z.SafeParseSuccess<T> | ValidationResponse => {
  const formDataObject: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    formDataObject[key] = value;
  }

  const validation = validationSchema.safeParse(formDataObject);
  if (validation.success) {
    return validation;
  } else {
    return {
      ...validation,
      errors: validation.error.flatten().fieldErrors,
    } as ValidationResponse;
  }
};
