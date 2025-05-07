import { apiPrefix, authPrefix, loginRoute, todoRoute } from "@/lib/constants";
import { LoginRequest } from "@/lib/types";

import { apiFetch } from "@/api";
import { ValidationError } from "@/components";

export const useAuthLogin = () => {
  const validate = (formData: FormData) => {
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    const errors: ValidationError[] = [];
    if (username!.length <= 3) {
      errors.push({
        name: "username",
        message: "Must be at least 3 characters long.",
      });
    }
    if (password!.length < 6) {
      errors.push({
        name: "password",
        message: "Must be at least 6 characters long.",
      });
    }

    return errors;
  };

  const onLogin = async (formData: FormData) => {
    const username = formData.get("username")!;
    const password = formData.get("password")!;

    const loginRequest = {
      username,
      password,
    } as LoginRequest;

    return await apiFetch(`${apiPrefix}/${authPrefix}/${loginRoute}`, {
      method: "POST",
      body: JSON.stringify(loginRequest),
    });
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return {
    validate,
    onLogin,
    onSuccess,
  };
};
