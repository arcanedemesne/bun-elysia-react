import React, { ReactNode } from "react";

import { DeleteIconButton, EditIconButton, Tooltip } from "@/lib/components";
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
    <CardBase
      title={todo.title}
      actionButtons={
        <>
          <Tooltip text="Edit Todo">
            <EditIconButton onClick={() => onEdit(todo.id)} />
          </Tooltip>
          <Tooltip text="Delete Todo">
            <DeleteIconButton onClick={() => onDelete(todo.id)} />
          </Tooltip>
        </>
      }
      audits={todo}
    >
      <>
        {todo.description && <p className="mt-1 justify-start text-sm text-gray-600">{todo.description}</p>}
        {!todo.description && <p className="mt-1 justify-start text-sm text-gray-300">No description</p>}
      </>
      {children}
    </CardBase>
  );
};
