import React, { ReactNode } from "react";

import { DeleteIconButton, EditIconButton } from "@/lib/components";
import { ITodoDTO } from "@/lib/models";

import { CardBase } from "@/components";

type TodoCardProps = {
  todo: ITodoDTO;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const TodoCard = ({ todo, onDelete, onEdit, children }: TodoCardProps) => {
  return (
    <CardBase>
      <>
        <div className="flex items-center justify-between">
          <h3 className="flex justify-start text-lg font-semibold text-gray-800">{todo.title}</h3>
          <div className="flex justify-end space-x-2">
            <EditIconButton onClick={() => onEdit(todo.id)} />
            <DeleteIconButton onClick={() => onDelete(todo.id)} />
          </div>
        </div>
        {todo.description && <p className="mt-1 justify-start text-sm text-gray-600">{todo.description}</p>}
        {!todo.description && <p className="mt-1 justify-start text-sm text-gray-300">No description</p>}
        <p className="mt-1 text-sm text-gray-600">
          Created by: <span className="font-medium">{todo.createdBy?.username}</span>
        </p>
        {todo.updatedBy && (
          <p className="mt-1 text-sm text-gray-600">
            Last updated by: <span className="font-medium">{todo.updatedBy.username}</span>
          </p>
        )}
      </>
      {children}
    </CardBase>
  );
};
