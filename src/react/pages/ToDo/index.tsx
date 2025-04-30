"use client";

import React, { MouseEvent, useState } from "react";

import { ToDo } from "../../../types";
import { useAuthCheck, useTeams, useToDos } from "../../hooks";
import {
  Layout,
  ErrorMessage,
  CardGrid,
  ToDoCard,
  Form,
  Modal,
  Button,
  ButtonModes,
  DropDownInput,
  DeleteModal,
} from "../../components";

export const ToDoPage = () => {
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
  } = useToDos();

  const { getData: getTeams, refetch: refetchTeams } = useTeams();

  const { isPending, error, data: todos } = getTodos(selectedTeamId);
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
        label: `${t.name} [${t.todos} todo(s)]`,
        value: t.id,
      }))
    : [];

  return (
    <Layout title="ToDo List">
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
                  { label: `My Personal ToDos`, value: "" },
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
          todos.map((todo: ToDo) => (
            <ToDoCard
              key={todo.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              todo={todo}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing a ToDo Item"
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
        title="Deleting a ToDo Item"
        itemName={todoForDelete?.title}
        isOpen={isDeleteModelOpen && !!todoForDelete}
        onClose={handleCloseDeleteModal}
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
