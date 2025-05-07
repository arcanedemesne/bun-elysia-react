"use client";

import React from "react";

import { registerRoute } from "@/lib/constants";

import { Form, Layout, LayoutTypes, LinkButton } from "@/components";
import { useAuthLogin } from "@/hooks";

export const LoginPage = () => {
  const { validate, onLogin, onSuccess } = useAuthLogin();
  return (
    <Layout type={LayoutTypes.AUTH} title="Login">
      <Form
        inputs={[
          {
            type: "text",
            name: "username",
            label: "Username",
            placeholder: "Enter username",
            autoComplete: "username",
          },
          {
            type: "password",
            name: "password",
            label: "Password",
            placeholder: "Enter password",
          },
        ]}
        validate={validate}
        onSubmit={onLogin}
        onSuccess={onSuccess}
        submitButtonText="Login"
        secondaryButtons={
          <LinkButton to={`/${registerRoute}`}>
            Not a member yet? Register here!
          </LinkButton>
        }
      />
    </Layout>
  );
};
