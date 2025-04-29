"use client";

import React, { MouseEvent, useState } from "react";

import { TeamDTO } from "../../../types";
import { useAuthCheck, useTeams } from "../../hooks";
import {
  CardGrid,
  TeamCard,
  Layout,
  ErrorMessage,
  Form,
  Modal,
  Button,
  ButtonModes,
} from "../../components";

export const TeamPage = () => {
  useAuthCheck();

  const {
    isPending,
    error,
    teams,
    validate,
    onCreate,
    onEdit,
    onDelete,
    onSuccess,
  } = useTeams();
  const [isModelOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const teamForEdit = teams && teams.find((t) => t.id === editId);

  const handleEdit = (id: string) => {
    setEditId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditId(undefined);
    setIsModalOpen(false);
  };

  return (
    <Layout title="Team List">
      <ErrorMessage>{error?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form
          inputs={[
            { type: "text", name: "name", placeholder: "Add a new team..." },
          ]}
          validate={validate}
          onSubmit={onCreate}
          onSuccess={onSuccess}
          showCancelButton={true}
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {teams &&
          teams.map((team: TeamDTO) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onDelete={onDelete}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing a Team"
        isOpen={isModelOpen && !!teamForEdit}
        onClose={handleCloseModal}
      >
        <Form
          inputs={[
            {
              type: "hidden",
              name: "id",
              value: teamForEdit?.id,
            },
            {
              type: "text",
              name: "name",
              placeholder: "Add a team name...",
              value: teamForEdit?.name,
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
                const deleted = teamForEdit && onDelete(teamForEdit.id);
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
