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
    <div className="container">
      <form action={handleFormSubmit}>
        <input
          type="text"
          name="todoMessage"
          id="todo-input"
          placeholder="Add a new todo..."
        />
        <button type="submit" id="add-todo">
          Add Me
        </button>
      </form>

      {error && "An error has occurred: " + error.message}

      {isPending && "Loading..."}

      <ul id="todo-list">
        {todos?.length > 0 &&
          todos.map((todo: ToDoItem) => {
            return (
              <li className="todo-item" key={todo.id}>
                {todo.message}
                <button onClick={() => handleDeleteToDo(todo.id)}>trash</button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default ToDo;
