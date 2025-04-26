"use client";

import React from "react";
import { Link } from "react-router-dom";

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

export const Login = () => {
  const validate = (formData: FormData) => {
    const username = formData.get("username");
    const password = formData.get("password");

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

  const onSubmit = async (formData: FormData) => {
    const username = formData.get("username")!;
    const password = formData.get("password")!;

    const loginInfo = {
      username,
      password,
    } as LoginInfo;

    return await apiFetch(`${apiPrefix}/${authPrefix}/${loginRoute}`, {
      method: "POST",
      body: JSON.stringify(loginInfo),
    });
  };

  const onSuccess = () => {
    location.href = `/${todoRoute}`;
  };

  return (
    <Layout type={LayoutTypes.AUTH} title="Login">
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
        ]}
        validate={validate}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        secondaryButtons={
          <Link
            to={`/${registerRoute}`}
            className="inline-block align-baseline text-sm font-semibold text-purple-500 hover:text-purple-800"
          >
            Not a member yet? Register here!
          </Link>
        }
      />
    </Layout>
  );
};
