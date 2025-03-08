"use client";

import React, { Key } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { ToDoItem } from "../../../types/ToDo";

const ToDo = () => {
  const queryClient = useQueryClient();

  const {
    isPending,
    error,
    data: todos,
  } = useQuery({
    queryKey: ["todoData"],
    queryFn: () => fetch("/api/todos").then((res) => res.json()),
  });

  const handleFormSubmit = async (formData: FormData) => {
    "use server";

    const newTodo = {
      id: uuidv4(),
      message: formData.get("todoMessage"),
    } as ToDoItem;

    const response = await fetch("api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    });

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["todoData"] });
    } else {
      alert("error");
    }
  };

  const handleDeleteToDo = async (id: Key) => {
    "use server";

    const response = await fetch(`api/todos/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["todoData"] });
    } else {
      alert("error");
    }
  };

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full rounded bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Todo List</h1>

        <div className="mb-4">
          <form action={handleFormSubmit}>
            <div className="flex items-center">
              <input
                type="text"
                name="todoMessage"
                placeholder="Add a new todo..."
                className="flex-grow rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
              >
                Add Me
              </button>
            </div>
          </form>
        </div>

        {error && "An error has occurred: " + error.message}

        {isPending && "Loading..."}

        <ul>
          {todos?.length > 0 &&
            todos.map((todo: ToDoItem) => {
              return (
                <li
                  key={todo.id}
                  className="flex items-center justify-between border-b p-3"
                >
                  {todo.message}
                  <button
                    onClick={() => handleDeleteToDo(todo.id)}
                    className="cursor-pointer text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default ToDo;
