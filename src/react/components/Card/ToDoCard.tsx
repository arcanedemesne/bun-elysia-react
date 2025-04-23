import React, { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { apiPrefix, todoRoute } from "../../../constants";
import { ToDo } from "../../../types";
import { apiFetch } from "../../api";
import { CardBase } from "./CardBase";
import { TrashIcon } from "..";

type ToDoCardProps = {
  todo: ToDo;
  children?: ReactNode;
};

export const ToDoCard = ({ todo, children }: ToDoCardProps) => {
  const queryClient = useQueryClient();

  const handleDeleteToDo = async (id: string) => {
    ("use server");

    const response = await apiFetch(`/${apiPrefix}/${todoRoute}/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["todoData"] });
      queryClient.refetchQueries({ queryKey: ["todoData"] });
    } else {
      alert("error");
    }
  };

  return (
    <CardBase>
      <div className="mb-2 flex items-center justify-between">
        <p className="mb-1 text-sm text-gray-600">{todo.message}</p>
        <button
          onClick={() => handleDeleteToDo(todo.id)}
          className="cursor-pointer text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <TrashIcon />
        </button>
      </div>
      {children}
    </CardBase>
  );
};
