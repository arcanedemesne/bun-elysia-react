import React, { ReactNode, useActionState, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { usePersistentForm } from "../../hooks";
import { ErrorMessage } from "..";
import { ApiError } from "../../api";

export type ValidationError = {
  name: string;
  message: string;
};

type ValueType = string | number | readonly string[] | undefined;

export type FormInputProps = {
  type: string;
  name: string;
  label?: string;
  value?: ValueType;
  placeholder?: string;
};

type FormProps = {
  inputs: FormInputProps[];
  validate: (formData: FormData) => ValidationError[];
  onSubmit: (formData: FormData) => Promise<any>;
  onSuccess?: (data?: any) => void;
  showCancelButton?: boolean;
  secondaryButtons?: ReactNode;
};

export const Form = ({
  inputs,
  validate,
  onSubmit,
  onSuccess,
  showCancelButton = false,
  secondaryButtons,
}: FormProps) => {
  const [output, formAction, isPending] = useActionState<
    string | undefined,
    FormData
  >(async (prev, formData) => {
    await handleFormSubmit(formData);
    return `handleFormSubmit`;
  }, undefined);

  const getDefaultValues = () => {
    const inputMap = new Map<string, ValueType>();
    inputs.forEach((i) => {
      inputMap.set(i.name, i.value);
    });
    return inputMap;
  };

  const [inputValues, setInputValues] =
    useState<Map<string, ValueType>>(getDefaultValues());
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const formRef = useRef<HTMLFormElement>(null);

  usePersistentForm(formRef);

  const resetForm = () => {
    setApiError("");
    setValidationErrors([]);
    formRef.current?.reset();
    setInputValues(getDefaultValues());
  };

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await onSubmit(formData);
    },
    onSuccess: (data) => {
      onSuccess && onSuccess(data);
      resetForm();
    },
    onError: (error: ApiError) => {
      setApiError(error.message);
    },
  });

  const handleFormSubmit = (formData: FormData) => {
    ("use server");

    setApiError("");
    setValidationErrors([]);
    const errors = validate(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <form action={formAction} ref={formRef}>
      <ErrorMessage>{apiError}</ErrorMessage>

      {inputs.map((input) => {
        const error = validationErrors.find((e) => e.name === input.name);
        return (
          <div className="mb-4" key={input.name}>
            {input.label && (
              <label
                htmlFor={input.name}
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                {input.label}
              </label>
            )}
            {error?.message && <ErrorMessage>{error.message}</ErrorMessage>}
            <input
              type={input.type}
              id={input.name}
              name={input.name}
              value={inputValues.get(input.name) || ""}
              onChange={(event) => {
                setInputValues((prev) =>
                  new Map(prev).set(input.name, event.target.value),
                );
              }}
              placeholder={input.placeholder}
              className="w-full rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        );
      })}
      <div className="mt-6 flex items-center justify-between">
        {secondaryButtons}
        {showCancelButton && (
          <button
            type="button"
            onClick={resetForm}
            className="cursor-pointer rounded-full px-4 py-2 font-bold text-purple-500 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || createMutation.isPending}
          className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
        >
          Add
        </button>
      </div>
    </form>
  );
};
