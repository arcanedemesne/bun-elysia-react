import React, { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { apiPrefix, todoRoute } from "../../../constants";
import { ToDo } from "../../../types";
import { apiFetch } from "../../api";
import { CardBase } from "./CardBase";
import { DeleteButton } from "..";

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
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{todo.title}</h3>
          <DeleteButton onDelete={() => handleDeleteToDo(todo.id)} />
        </div>
        <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
        <p className="mt-1 text-sm text-gray-600">
          Created by:{" "}
          <span className="font-medium">{todo.createdBy.username}</span>
        </p>
      </div>
      {children}
    </CardBase>
  );
};
