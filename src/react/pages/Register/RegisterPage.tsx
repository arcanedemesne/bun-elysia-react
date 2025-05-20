import React from "react";

import { LinkButton } from "@/lib/components";
import { loginRoute } from "@/lib/constants";
import { RegisterRequest } from "@/lib/types";

import { Form, Layout, LayoutTypes } from "@/components";
import { useAuthRegister } from "@/hooks";

export const RegisterPage = () => {
  const { validationSchema, onRegister, onSuccess } = useAuthRegister();
  return (
    <Layout type={LayoutTypes.AUTH} title="Register">
      <Form<RegisterRequest>
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
        validationSchema={validationSchema}
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
