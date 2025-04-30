import React, { ReactNode, useActionState, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { usePersistentForm } from "../../hooks";
import {
  Button,
  ButtonModes,
  ErrorMessage,
  HiddenInput,
  InputProps,
  TextInput,
  ValidationError,
  ValueType,
} from "..";
import { ApiError } from "../../../types";

type FormProps = {
  inputs: InputProps[];
  validate: (formData: FormData) => ValidationError[];
  onSubmit: (formData: FormData) => Promise<any>;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  secondaryButtons?: ReactNode;
};

export const Form = ({
  inputs,
  validate,
  onSubmit,
  onSuccess,
  onCancel,
  submitButtonText,
  cancelButtonText,
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

  const handleCancel = () => {
    onCancel && onCancel();
    resetForm();
  };
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
      error.validation && setApiError(error.validation);
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
        let control;

        switch (input.type) {
          case "hidden":
            control = <HiddenInput {...input} />;
            break;
          case "password":
          case "text":
            control = (
              <TextInput
                {...input}
                value={inputValues.get(input.name) ?? input.value}
                error={error}
                onChange={(event) => {
                  setInputValues((prev) =>
                    new Map(prev).set(input.name, event.target.value),
                  );
                }}
              />
            );
            break;
          default:
            control = <>invlid input</>;
            break;
        }

        return (
          <div
            className={input.type !== "hidden" ? "mb-4" : ""}
            key={input.name}
          >
            {control}
          </div>
        );
      })}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex w-full justify-start">{secondaryButtons}</div>
        <div className="flex items-center space-x-4">
          {showCancelButton && (
            <Button
              type="button"
              onClick={handleCancel}
              mode={ButtonModes.SECONDARY}
            >
            {cancelButtonText ? cancelButtonText : "Cancel"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending || createMutation.isPending}
            mode={ButtonModes.PRIMARY}
          >
            {submitButtonText ? submitButtonText : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
};
