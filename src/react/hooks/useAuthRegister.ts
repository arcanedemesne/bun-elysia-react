import { z } from "zod";

import {
  apiPrefix,
  authPrefix,
  registerRoute,
  todoRoute,
} from "@/lib/constants";
import { RegisterRequest } from "@/lib/types";
import { emailSchema, passwordSchema, usernameSchema } from "@/lib/validation";

import { ApiService } from "@/api";

export const useAuthRegister = () => {
  const apiService = new ApiService();

  const validationSchema = z
    .object({
      username: usernameSchema,
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

  const onRegister = async (request: RegisterRequest) => {
    return await apiService.post(
      `${apiPrefix}/${authPrefix}/${registerRoute}`,
      request,
    );
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return {
    validationSchema,
    onRegister,
    onSuccess,
  };
};
