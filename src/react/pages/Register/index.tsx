"use client";

import React from "react";

import {
  apiPrefix,
  authPrefix,
  loginRoute,
  registerRoute,
  todoRoute,
} from "../../../constants";
import { LoginInfo } from "../../../types";
import { Layout, Form, ValidationError, LayoutTypes } from "../../components";
import { apiFetch } from "../../api";

export const Register = () => {
  const validate = (formData: FormData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

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
    if (password !== confirmPassword) {
      errors.push({
        name: "confirmPassword",
        message: "Passwords must match.",
      });
    }

    return errors;
  };

  const onSubmit = async (formData: FormData) => {
    const username = formData.get("username")!;
    const password = formData.get("password")!;

    const loginInfo = {
      username,
      password,
    } as LoginInfo;

    return await apiFetch(`${apiPrefix}/${authPrefix}/${registerRoute}`, {
      method: "POST",
      body: JSON.stringify(loginInfo),
    });
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return (
    <Layout type={LayoutTypes.AUTH} title="Register">
      <Form
        inputs={[
          {
            type: "text",
            name: "username",
            label: "Username",
            placeholder: "Enter username",
          },
          {
            type: "text",
            name: "password",
            label: "Password",
            placeholder: "Enter password",
          },
          {
            type: "text",
            name: "confirmPassword",
            label: "Confirm Password",
            placeholder: "Confirm password",
          },
        ]}
        validate={validate}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        secondaryButtons={
          <a
            href={`/${loginRoute}`}
            className="inline-block align-baseline text-sm font-semibold text-purple-500 hover:text-purple-800"
          >
            Already a member?
          </a>
        }
      />
    </Layout>
  );
};
