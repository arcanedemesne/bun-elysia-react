import React, { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ToDo } from "../../../types";
import { CardBase } from "./CardBase";
import { DeleteButton, EditButton } from "..";

type ToDoCardProps = {
  todo: ToDo;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const ToDoCard = ({
  todo,
  onDelete,
  onEdit,
  children,
}: ToDoCardProps) => {
  return (
    <CardBase>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h3 className="flex justify-start text-lg font-semibold text-gray-800">
            {todo.title}
          </h3>
          <div className="flex justify-end space-x-2">
            <EditButton onClick={() => onEdit(todo.id)} />
            <DeleteButton onClick={() => onDelete(todo.id)} />
          </div>
        </div>
        <p className="mt-1 justify-start text-sm text-gray-600">
          {todo.description}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Created by:{" "}
          <span className="font-medium">{todo.createdBy.username}</span>
        </p>
      </div>
      {children}
    </CardBase>
  );
};
