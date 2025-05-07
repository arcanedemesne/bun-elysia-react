import {
  apiPrefix,
  authPrefix,
  registerRoute,
  todoRoute,
} from "@/lib/constants";
import { RegisterRequest } from "@/lib/types";

import { apiFetch } from "@/api";
import { ValidationError } from "@/components";

export const useAuthRegister = () => {
  const validate = (formData: FormData) => {
    const username = formData.get("username")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    const errors: ValidationError[] = [];
    if (username!.length <= 3) {
      errors.push({
        name: "username",
        message: "Must be at least 3 characters long.",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === undefined || !emailRegex.test(email)) {
      errors.push({
        name: "email",
        message: "Invalid email address.",
      });
    }
    if (password!.length < 6) {
      errors.push({
        name: "password",
        message: "Must be at least 6 characters long.",
      });
    }
    if (password !== confirmPassword) {
      errors.push({
        name: "confirmPassword",
        message: "Passwords must match.",
      });
    }

    return errors;
  };

  const onRegister = async (formData: FormData) => {
    const username = formData.get("username")!;
    const email = formData.get("email")!;
    const password = formData.get("password")!;

    const registerRequest = {
      username,
      email,
      password,
    } as RegisterRequest;

    return await apiFetch(`${apiPrefix}/${authPrefix}/${registerRoute}`, {
      method: "POST",
      body: JSON.stringify(registerRequest),
    });
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return {
    validate,
    onRegister,
    onSuccess,
  };
};
