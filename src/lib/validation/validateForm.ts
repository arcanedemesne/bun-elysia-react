import { z } from "zod";

export type ValidationResponse = {
  isValid: boolean;
  validatedData: any;
  errors: FieldErrors | undefined;
};

export type FieldErrors = {
  [x: string]: string[] | undefined;
  [x: number]: string[] | undefined;
  [x: symbol]: string[] | undefined;
};

export const validateForm = (
  formData: FormData,
  validationSchema: z.Schema,
): ValidationResponse => {
  const formDataObject: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    formDataObject[key] = value;
  }

  try {
    const validatedData = validationSchema.parse(formDataObject);
    return {
      isValid: true,
      validatedData,
      errors: undefined,
    } as ValidationResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        validatedData: undefined,
        errors: error.flatten().fieldErrors,
      } as ValidationResponse;
    } else {
      console.error("An unexpected error occurred:", error);
      return {
        isValid: false,
        validatedData: undefined,
        errors: undefined,
      } as ValidationResponse;
    }
  }
};
