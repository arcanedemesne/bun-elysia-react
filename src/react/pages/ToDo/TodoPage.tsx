import React, { MouseEvent, useState } from "react";

import { Button, ButtonModes, DeleteModal, DropDownInput, ErrorMessage, Modal } from "@/lib/components";
import { ITodoInsert, ITodoUpdate } from "@/lib/models";

import { TodoCard } from "./TodoCard";
import { CardGrid, Form, Layout } from "@/components";
import { useAuthCheck, useOrganizations, useTeams, useTodos } from "@/hooks";

export const TodoPage = () => {
  useAuthCheck();

  const [isEditModelOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [isDeleteModelOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>(undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);

  const {
    getData: getTodos,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch: refetchTodos,
  } = useTodos();

  const {
    isPending,
    error,
    data: todos,
  } = getTodos({
    organizationId: selectedOrganizationId,
    teamId: selectedTeamId,
  });

  const { getData: getOrganizations, refetch: refetchOrganizations } = useOrganizations();
  const { data: organizations } = getOrganizations();

  const { getData: getTeams, refetch: refetchTeams } = useTeams();
  const { data: teams } = getTeams(selectedOrganizationId);

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
    refetchOrganizations();
    refetchTeams();
  };

  const todoForEdit = todos && todos.find((t) => t.id === editId);
  const todoForDelete = todos && todos.find((t) => t.id === deleteId);

  const selectedOrganization = organizations && organizations.find((o) => o.id === selectedOrganizationId);

  const organizationOptions = organizations
    ? organizations.map((t) => ({
        label: `${t.name} (${t.teamsCount} team${t.teamsCount > 0 ? "s" : ""})`,
        value: t.id,
      }))
    : [];

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
        <Form<ITodoInsert>
          inputs={[
            { type: "hidden", name: "organizatinId", value: selectedOrganizationId },
            { type: "hidden", name: "teamId", value: selectedTeamId },
            { type: "text", name: "title", placeholder: "Add a new todo..." },
          ]}
          validationSchema={createValidationSchema}
          onSubmit={onCreate}
          onSuccess={handleSuccess}
          submitButtonText="Add"
          showCancelButton
          secondaryButtons={
            <>
              <div className="w-3/11">
                <DropDownInput
                  type="select"
                  name="organization"
                  value={selectedOrganizationId}
                  options={[{ label: `My Personal Todos`, value: undefined }, ...organizationOptions]}
                  onChange={(value) => {
                    handleSuccess();
                    setSelectedOrganizationId(value);
                  }}
                />
              </div>
              {selectedOrganization && (
                <div className="w-3/11">
                  <DropDownInput
                    type="select"
                    name="team"
                    value={selectedTeamId}
                    options={[
                      { label: `All Todos for ${selectedOrganization?.name}`, value: undefined },
                      ...teamOptions,
                    ]}
                    onChange={(value) => {
                      handleSuccess();
                      setSelectedTeamId(value);
                    }}
                  />
                </div>
              )}
            </>
          }
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {todos &&
          todos.map((todo) => <TodoCard key={todo.id} onEdit={handleEdit} onDelete={handleDelete} todo={todo} />)}
      </CardGrid>

      <Modal title="Editing a Todo Item" isOpen={isEditModelOpen && !!todoForEdit} onClose={handleCloseEditModal}>
        <Form<ITodoUpdate>
          inputs={[
            {
              type: "hidden",
              name: "id",
              value: todoForEdit?.id,
            },
            {
              type: "hidden",
              name: "teamId",
              value: selectedTeamId,
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
          validationSchema={editValidationSchema}
          onSubmit={onEdit}
          onSuccess={() => {
            handleCloseEditModal();
            handleSuccess();
          }}
          onCancel={handleCloseEditModal}
          submitButtonText="Edit"
          showCancelButton
          secondaryButtons={
            <div className="w-auto">
              <Button
                mode={ButtonModes.DELETE}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                  handleDelete(todoForEdit!.id);
                }}
              >
                Delete
              </Button>
            </div>
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
