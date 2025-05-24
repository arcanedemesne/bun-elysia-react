import { z } from "zod";

import { apiPrefix, authPrefix, loginRoute, todoRoute } from "@/lib/constants";
import { ApiService } from "@/lib/services/ApiService";
import { LoginRequest } from "@/lib/types";
import { passwordSchema, usernameSchema } from "@/lib/validation";

export const useAuthLogin = () => {
  const apiService = new ApiService();

  const validationSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
  });

  const onLogin = async (request: LoginRequest) => {
    return await apiService.post(`${apiPrefix}/${authPrefix}/${loginRoute}`, request);
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return {
    validationSchema,
    onLogin,
    onSuccess,
  };
};
