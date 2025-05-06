"use client";

import React, { MouseEvent, useState } from "react";

import { TodoCard } from "./TodoCard";
import {
  Button,
  ButtonModes,
  CardGrid,
  DeleteModal,
  DropDownInput,
  ErrorMessage,
  Form,
  Layout,
  Modal,
} from "@/components";
import { useAuthCheck, useTeams, useTodos } from "@/hooks";

export const TodoPage = () => {
  useAuthCheck();

  const [isEditModelOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [isDeleteModelOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const [selectedTeamId, setSelectedTeamId] = useState("");

  const {
    getData: getTodos,
    validate,
    onCreate,
    onEdit,
    onDelete,
    refetch: refetchTodos,
  } = useTodos();

  const { isPending, error, data: todos } = getTodos(selectedTeamId);

  const { getData: getTeams, refetch: refetchTeams } = useTeams();
  const { data: teams } = getTeams();

  const handleEdit = (id: string) => {
    setEditId(id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditId(undefined);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteId(undefined);
    setIsDeleteModalOpen(false);
  };

  const handleSuccess = () => {
    refetchTodos();
    refetchTeams();
  };

  const todoForEdit = todos && todos.find((t) => t.id === editId);
  const todoForDelete = todos && todos.find((t) => t.id === deleteId);

  const teamOptions = teams
    ? teams.map((t) => ({
        label: `${t.name} (${t.todosCount} todo${t.todosCount > 0 ? "s" : ""})`,
        value: t.id,
      }))
    : [];

  return (
    <Layout title="Todo List">
      <ErrorMessage>{error?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form
          inputs={[
            { type: "hidden", name: "teamId", value: selectedTeamId },
            { type: "text", name: "title", placeholder: "Add a new todo..." },
          ]}
          validate={validate}
          onSubmit={onCreate}
          onSuccess={handleSuccess}
          submitButtonText="Add"
          showCancelButton={true}
          secondaryButtons={
            <div className="w-3/11">
              <DropDownInput
                type="select"
                name="team"
                value={selectedTeamId}
                options={[
                  { label: `My Personal Todos`, value: "" },
                  ...teamOptions,
                ]}
                onChange={(value) => {
                  handleSuccess();
                  setSelectedTeamId(value);
                }}
              />
            </div>
          }
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {todos &&
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              todo={todo}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing a Todo Item"
        isOpen={isEditModelOpen && !!todoForEdit}
        onClose={handleCloseEditModal}
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
              label: "Title",
              placeholder: "Add a title...",
              value: todoForEdit?.title,
            },
            {
              type: "text",
              name: "description",
              label: "Description",
              placeholder: "Add a description...",
              value: todoForEdit?.description,
            },
          ]}
          validate={validate}
          onSubmit={onEdit}
          onSuccess={() => {
            handleCloseEditModal();
            handleSuccess();
          }}
          onCancel={handleCloseEditModal}
          submitButtonText="Edit"
          showCancelButton={true}
          secondaryButtons={
            <Button
              mode={ButtonModes.DELETE}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handleDelete(todoForEdit!.id);
              }}
            >
              Delete
            </Button>
          }
        />
      </Modal>

      <DeleteModal
        title="Deleting a Todo Item"
        itemName={todoForDelete?.title}
        isOpen={isDeleteModelOpen && !!todoForDelete}
        onCancel={() => {
          handleCloseDeleteModal();
        }}
        onDelete={() => {
          const deleted = todoForDelete && onDelete(todoForDelete.id);
          deleted && handleCloseEditModal();
          deleted && handleCloseDeleteModal();
        }}
      />
    </Layout>
  );
};
