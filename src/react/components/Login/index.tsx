"use client";

import React, { useActionState, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { LoginInfo } from "../../../types/LoginInfo";
import usePersistentForm from "../../hooks/usePersistentForm";
import { apiPrefix, authPrefix, loginRoute, registerRoute, todoRoute } from "../../../constants";

const Login = () => {
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

    if (username.length <= 3 || password.length < 6) {
      return;
    }

    ("use server");

    const loginInfo = {
      username,
      password,
    } as LoginInfo;

    const response = await fetch(`${apiPrefix}/${authPrefix}/${loginRoute}`, {
      method: "POST",
      body: JSON.stringify(loginInfo),
    });

    const result = await response.json();
    if (response.status === 200 && result.successful) {
      location.href = `/${todoRoute}`; // should navigate, but there's a race condition with user state in server
      //navigate(`/${todoRoute}`);
    } else {
      setErrorMessage(result.errorMessage);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-96 rounded bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold">Login</h2>

        {errorMessage && (
          <div className="mt-2 flex items-center text-sm text-red-500">
            <span>{errorMessage}</span>
          </div>
        )}

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

          <div className="flex items-center justify-between">
            <Link
              to={`/${registerRoute}`}
              className="inline-block align-baseline text-sm font-semibold text-purple-500 hover:text-purple-800"
            >
              Not a member yet? Register here!
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
