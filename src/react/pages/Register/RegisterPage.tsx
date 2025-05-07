"use client";

import React from "react";

import { loginRoute } from "@/lib/constants";

import { Form, Layout, LayoutTypes, LinkButton } from "@/components";
import { useAuthRegister } from "@/hooks";

export const RegisterPage = () => {
  const { validate, onRegister, onSuccess } = useAuthRegister();
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
            name: "email",
            label: "Email",
            placeholder: "Enter email",
          },
          {
            type: "password",
            name: "password",
            label: "Password",
            placeholder: "Enter password",
          },
          {
            type: "password",
            name: "confirmPassword",
            label: "Confirm Password",
            placeholder: "Confirm password",
          },
        ]}
        validate={validate}
        onSubmit={onRegister}
        onSuccess={onSuccess}
        submitButtonText="Register"
        secondaryButtons={
          <LinkButton to={`/${loginRoute}`}>Already a member?</LinkButton>
        }
      />
    </Layout>
  );
};
