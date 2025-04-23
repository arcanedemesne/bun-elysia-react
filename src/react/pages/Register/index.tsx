"use client";

import React, { useActionState, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  apiPrefix,
  authPrefix,
  loginRoute,
  registerRoute,
  todoRoute,
} from "../../../constants";
import { LoginInfo } from "../../../types";
import { usePersistentForm } from "../../hooks";
import { AuthLayout, ErrorMessage } from "../../components";

export const Register = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [output, formAction, isPending] = useActionState<
    string | undefined,
    FormData
  >(async (prev, formData) => {
    await handleFormSubmit(formData);
    return `handleFormSubmit`;
  }, undefined);

  const formRef = useRef<HTMLFormElement>(null);
  usePersistentForm(formRef);

  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSubmit = async (formData: FormData) => {
    const username = formData.get("username")!;
    const password = formData.get("password")!;
    const confirmPassword = formData.get("confirmPassword")!;

    if (username.length <= 3 || password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords must match");
      return;
    }

    ("use server");

    const loginInfo = {
      username,
      password,
    } as LoginInfo;

    const response = await fetch(
      `${apiPrefix}/${authPrefix}/${registerRoute}`,
      {
        method: "POST",
        body: JSON.stringify(loginInfo),
      },
    );

    const result = await response.json();
    if (response.status === 200 && result.successful) {
      queryClient.invalidateQueries({ queryKey: ["loginCheck"] });
      queryClient.refetchQueries({ queryKey: ["loginCheck"] });
      location.href = `/${todoRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`/${todoRoute}`);
    } else {
      setErrorMessage(result.errorMessage);
    }
  };

  return (
    <AuthLayout title="Register">
      <ErrorMessage>{errorMessage}</ErrorMessage>

      <form action={formAction} ref={formRef}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Enter username"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Enter password"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-bold text-gray-700"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="Confirm password"
          />
        </div>

        <div className="flex items-center justify-between">
          <a
            href={`/${loginRoute}`}
            className="inline-block align-baseline text-sm font-semibold text-purple-500 hover:text-purple-800"
          >
            Already a member?
          </a>
          <button
            type="submit"
            disabled={isPending}
            className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
          >
            Register
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
