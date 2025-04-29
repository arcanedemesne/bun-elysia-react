"use client";

import React, { MouseEvent, useState } from "react";

import { ToDo } from "../../../types";
import { useAuthCheck, useToDos } from "../../hooks";
import {
  Layout,
  ErrorMessage,
  CardGrid,
  ToDoCard,
  Form,
  Modal,
  Button,
  ButtonModes,
} from "../../components";

export const ToDoPage = () => {
  useAuthCheck();

  const {
    isPending,
    error,
    todos,
    validate,
    onCreate,
    onEdit,
    onDelete,
    onSuccess,
  } = useToDos();
  const [isModelOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const todoForEdit = todos && todos.find((t) => t.id === editId);

  const handleEdit = (id: string) => {
    setEditId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditId(undefined);
    setIsModalOpen(false);
  };

  return (
    <Layout title="ToDo List">
      <ErrorMessage>{error?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form
          inputs={[
            { type: "text", name: "title", placeholder: "Add a new todo..." },
          ]}
          validate={validate}
          onSubmit={onCreate}
          onSuccess={onSuccess}
          showCancelButton={true}
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {todos &&
          todos.map((todo: ToDo) => (
            <ToDoCard
              key={todo.id}
              onEdit={handleEdit}
              onDelete={onDelete}
              todo={todo}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing a ToDo Item"
        isOpen={isModelOpen && !!todoForEdit}
        onClose={handleCloseModal}
      >
        <Form
          inputs={[
            {
              type: "hidden",
              name: "id",
              value: todoForEdit?.id,
            },
            {
              type: "text",
              name: "title",
              placeholder: "Add a title...",
              value: todoForEdit?.title,
            },
            {
              type: "text",
              name: "description",
              placeholder: "Add a description...",
              value: todoForEdit?.description,
            },
          ]}
          validate={validate}
          onSubmit={onEdit}
          onSuccess={() => {
            handleCloseModal();
            onSuccess();
          }}
          onCancel={handleCloseModal}
          showCancelButton={true}
          secondaryButtons={
            <Button
              mode={ButtonModes.DELETE}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                const deleted = todoForEdit && onDelete(todoForEdit.id);
                deleted && handleCloseModal();
              }}
            >
              Delete
            </Button>
          }
        />
      </Modal>
    </Layout>
  );
};
