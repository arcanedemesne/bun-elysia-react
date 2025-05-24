import { useMutation } from "@tanstack/react-query";
import React, { ReactNode, useActionState, useRef, useState } from "react";

import { z } from "zod";

import {
  Button,
  ButtonModes,
  ErrorMessage,
  HiddenInput,
  InputProps,
  TextArea,
  TextInput,
  ValueType,
} from "@/lib/components";
import { ApiError } from "@/lib/types";
import { FieldErrors, validateForm } from "@/lib/validation";

import { usePersistentForm } from "@/hooks";

type FormProps<T> = {
  inputs: InputProps[];
  validationSchema: z.Schema;
  onSubmit: (formData: T) => Promise<T>;
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  secondaryButtons?: ReactNode;
  disabled?: boolean;
};

export const Form = <T,>({
  inputs,
  validationSchema,
  onSubmit,
  onSuccess,
  onCancel,
  submitButtonText,
  cancelButtonText,
  showCancelButton = false,
  secondaryButtons,
  disabled,
}: FormProps<T>) => {
  const [_, formAction] = useActionState<string | undefined, FormData>(async (_, formData) => {
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

  const [inputValues, setInputValues] = useState<Map<string, ValueType>>(getDefaultValues());
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  usePersistentForm(formRef);

  const handleCancel = () => {
    onCancel && onCancel();
    resetForm();
  };

  const resetForm = () => {
    setApiError("");
    setValidationErrors({});
    formRef.current?.reset();
    setInputValues(getDefaultValues());
  };

  const createMutation = useMutation({
    mutationFn: async (data: T) => {
      return await onSubmit(data);
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
    setValidationErrors({});
    const validation = validateForm<T>(formData, validationSchema);

    if (validation.success) {
      createMutation.mutate(validation.data);
    } else {
      setValidationErrors(validation.errors ?? {});
    }
  };

  return (
    <form action={formAction} ref={formRef}>
      <ErrorMessage>{apiError}</ErrorMessage>

      {inputs.map((input) => {
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
                errors={validationErrors[input.name]}
                onChange={(event) => {
                  setInputValues((prev) => new Map(prev).set(input.name, event.target.value));
                }}
              />
            );
            break;
          case "textarea":
            control = (
              <TextArea
                {...input}
                value={inputValues.get(input.name) ?? input.value}
                errors={validationErrors[input.name]}
                onChange={(event) => {
                  setInputValues((prev) => new Map(prev).set(input.name, event.target.value));
                }}
              />
            );
            break;
          default:
            control = <>invlid input</>;
            break;
        }

        return (
          <div className={input.type !== "hidden" ? "mb-4" : ""} key={input.name}>
            {control}
          </div>
        );
      })}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex w-full justify-start">{secondaryButtons}</div>
        <div className="flex items-center space-x-4">
          {showCancelButton && (
            <Button type="button" onClick={handleCancel} mode={ButtonModes.SECONDARY}>
              {cancelButtonText ? cancelButtonText : "Cancel"}
            </Button>
          )}
          <Button type="submit" disabled={disabled || createMutation.isPending} mode={ButtonModes.PRIMARY}>
            {submitButtonText ? submitButtonText : "Submit"}
          </Button>
        </div>
      </div>
    </form>
  );
};
