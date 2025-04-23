"use client";

import React, { ChangeEvent, useActionState, useRef, useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { apiPrefix, todoRoute } from "../../../constants";
import { ToDo, ToDoInsert, UserDTO } from "../../../types";
import { usePersistentForm, useAuthCheck } from "../../hooks";
import { apiFetch } from "../../api";
import { Layout, ErrorMessage, CardGrid, ToDoCard } from "../../components";

type ToDoPageProps = {
  user: UserDTO;
};

export const ToDoPage = ({ user }: ToDoPageProps) => {
  const queryClient = useQueryClient();

  useAuthCheck();

  const [output, formAction, isPending] = useActionState<
    string | undefined,
    FormData
  >(async (prev, formData) => {
    await handleFormSubmit(formData);
    return `handleFormSubmit`;
  }, undefined);

  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  usePersistentForm(formRef);

  const {
    isPending: isGetPending,
    error,
    data: todos,
  } = useQuery({
    queryKey: ["todoData", user.id],
    queryFn: () => apiFetch(`/${apiPrefix}/${todoRoute}/${user.id}`),
  });

  const createToDoMutation = useMutation({
    mutationFn: async () => {
      ("use server");

      const newTodo = {
        userId: user.id,
        message,
      } as ToDoInsert;

      return await apiFetch(`/${apiPrefix}/${todoRoute}`, {
        method: "POST",
        body: JSON.stringify(newTodo),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todoData", user.id] });
      queryClient.refetchQueries({ queryKey: ["todoData", user.id] });
      setMessage("");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleFormSubmit = async (formData: FormData) => {
    const message = formData.get("todoMessage");

    setErrorMessage("");
    if (message!.length < 6) {
      setErrorMessage("Must be at least 6 characters long.");
      return;
    }

    createToDoMutation.mutate();
  };

  return (
    <Layout title="ToDo List">
      <ErrorMessage>{errorMessage}</ErrorMessage>

      <div className="mb-4">
        <form action={formAction} ref={formRef}>
          <div className="flex items-center">
            <input
              type="text"
              name="todoMessage"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setMessage(e.target.value);
              }}
              placeholder="Add a new todo..."
              className="flex-grow rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {error && (
        <ErrorMessage>{`An error has occurred: ${error.message}`}</ErrorMessage>
      )}

      {isGetPending && "Loading..."}

      <CardGrid>
        {todos &&
          todos.map((todo: ToDo) => <ToDoCard key={todo.id} todo={todo} />)}
      </CardGrid>
    </Layout>
  );
};
