"use client";

import React, { ChangeEventHandler, MouseEvent, useState } from "react";

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
  TypeAheadSearchInput,
  CloseButton,
  Label,
  DeleteModal,
} from "../../components";

export const TeamPage = () => {
  useAuthCheck();

  const [isEditModelOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [isDeleteModelOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(
    undefined,
  );

  const { getData, validate, onCreate, onEdit, onDelete, refetch } = useTeams();

  const { isPending, error, data: teams } = getData();

  const teamForEdit = teams && teams.find((t) => t.id === editId);
  const teamForDelete = teams && teams.find((t) => t.id === deleteId);

  const searchOptions = [
    { label: "Jenny", value: "some guid" },
    { label: "Jenny New", value: "some new guid" },
  ];

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
          onSuccess={refetch}
          submitButtonText="Add"
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
              onDelete={handleDelete}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing a Team"
        isOpen={isEditModelOpen && !!teamForEdit}
        onClose={handleCloseEditModal}
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
              label: "Team Name",
              placeholder: "Add a team name...",
              value: teamForEdit?.name,
            },
          ]}
          validate={validate}
          onSubmit={onEdit}
          onSuccess={() => {
            handleCloseEditModal();
            refetch();
          }}
          onCancel={handleCloseEditModal}
          submitButtonText="Edit"
          showCancelButton={true}
          secondaryButtons={
            <Button
              mode={ButtonModes.DELETE}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handleDelete(teamForEdit!.id);
              }}
            >
              Delete
            </Button>
          }
        />
        <div className="mb-0 mt-5 flex items-end justify-between">
          <div className="flex:none mr-4 w-full">
            <Label htmlFor={"members"}>Add Members</Label>
            {!selectedMemberId && (
              <TypeAheadSearchInput
                name="members"
                placeholder="Search for members..."
                options={searchOptions}
                onSelect={(value) => {
                  setSelectedMemberId(value);
                }}
              />
            )}
            {selectedMemberId && (
              <div className="flex w-full items-end justify-between rounded border border-gray-800 p-2">
                {searchOptions.find((o) => o.value === selectedMemberId)?.label}{" "}
                <CloseButton
                  onClick={() => {
                    setSelectedMemberId(undefined);
                  }}
                />
              </div>
            )}
          </div>
          <div className="max-h-10">
            <Button
              mode={ButtonModes.SECONDARY}
              disabled={!!!selectedMemberId}
              onClick={() =>
                console.log(
                  "adding " +
                    searchOptions.find((o) => o.value === selectedMemberId)
                      ?.label,
                )
              }
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>

      <DeleteModal
        title="Deleting a Team"
        itemName={teamForDelete?.name}
        isOpen={isDeleteModelOpen && !!teamForDelete}
        onClose={handleCloseDeleteModal}
        onCancel={() => {
          handleCloseDeleteModal();
        }}
        onDelete={() => {
          const deleted = teamForDelete && onDelete(teamForDelete.id);
          deleted && handleCloseEditModal();
          deleted && handleCloseDeleteModal();
        }}
      />
    </Layout>
  );
};
