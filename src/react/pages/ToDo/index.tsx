"use client";

import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { apiPrefix, todoRoute } from "../../../constants";
import { ToDo, ToDoInsert, UserDTO } from "../../../types";
import { useAuthCheck } from "../../hooks";
import { apiFetch } from "../../api";
import {
  Layout,
  ErrorMessage,
  CardGrid,
  ToDoCard,
  ValidationError,
  Form,
} from "../../components";

type ToDoPageProps = {
  user: UserDTO;
};

export const ToDoPage = ({ user }: ToDoPageProps) => {
  const queryClient = useQueryClient();

  useAuthCheck();

  const {
    isPending: isGetPending,
    error: fetchError,
    data: todos,
  } = useQuery({
    queryKey: ["todoData"],
    queryFn: () => apiFetch(`/${apiPrefix}/${todoRoute}/${user.id}`),
  });

  const validate = (formData: FormData) => {
    const title = formData.get("title");

    const errors: ValidationError[] = [];
    if (title!.length < 6) {
      errors.push({
        name: "title",
        message: "Must be at least 6 characters long.",
      });
    }

    return errors;
  };

  const onSubmit = async (formData: FormData) => {
    const title = formData.get("title");

    const newTodo = {
      title,
      createdBy: user.id,
    } as ToDoInsert;

    return await apiFetch(`/${apiPrefix}/${todoRoute}`, {
      method: "POST",
      body: JSON.stringify(newTodo),
    });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["todoData"] });
    queryClient.refetchQueries({ queryKey: ["todoData"] });
  };

  return (
    <Layout title="ToDo List">
      <ErrorMessage>{fetchError?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form
          inputs={[
            { type: "text", name: "title", placeholder: "Add a new todo..." },
          ]}
          validate={validate}
          onSubmit={onSubmit}
          onSuccess={onSuccess}
        />
      </div>

      {isGetPending && "Loading..."}

      <CardGrid>
        {todos &&
          todos.map((todo: ToDo) => <ToDoCard key={todo.id} todo={todo} />)}
      </CardGrid>
    </Layout>
  );
};
