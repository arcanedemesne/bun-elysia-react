import React, { MouseEvent, useEffect, useState } from "react";

import {
  Button,
  ButtonModes,
  CloseIconButton,
  DeleteModal,
  DropDownInput,
  ErrorMessage,
  Label,
  Modal,
  Pill,
  TypeAheadSearchInput,
  TypeAheadSearchOption,
} from "@/lib/components";
import { PopOutChatWrapper } from "@/lib/components/Chat/PopOutChatWrapper";
import { ITeamInsert, ITeamUpdate } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { TeamCard } from "./TeamCard";
import { CardGrid, Form, Layout } from "@/components";
import { useAuthCheck, useOrganizations, useTeams, useUsers } from "@/hooks";

export const TeamPage = () => {
  useAuthCheck();

  const [isEditModelOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [isDeleteModelOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [searchOptions, setSearchOptions] = useState<TypeAheadSearchOption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | undefined>(undefined);

  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const {
    getData: getTeams,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch: refetchTeams,
    onAddMember,
    onRemoveMember,
  } = useTeams();

  const { getData: getOrganizations, refetch: refetchOrganizations } = useOrganizations();
  const { data: organizations } = getOrganizations();

  const { isPending, error, data: teams } = getTeams(selectedOrganizationId);

  const teamForEdit = teams && teams.find((t) => t.id === editId);
  const teamForDelete = teams && teams.find((t) => t.id === deleteId);
  const teamForChat = teams && teams.find((t) => t.id === chatId);

  const organizationOptions = organizations
    ? organizations.map((t) => ({
        label: `${t.name} (${t.teamsCount} team${t.teamsCount > 0 ? "s" : ""})`,
        value: t.id,
      }))
    : [];

  const { search, invalidate: invalidateSearch } = useUsers();

  useEffect(() => {
    const fetchData = async () => {
      const foundMembers = await search({ organizationId: teamForEdit?.organizationId, searchQuery });

      const searchOptions =
        foundMembers && foundMembers.length > 0
          ? foundMembers
              .filter((fm) => !teamForEdit?.members.map((m) => m.id).includes(fm.id))
              .map((m) => ({
                label: m.username,
                value: m.id,
              }))
          : [];

      setSearchOptions(searchOptions);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

  const handleChat = (id: string) => {
    setChatId(id);
  };

  const handleCloseChat = () => {
    setChatId(undefined);
  };

  const handleSuccess = () => {
    invalidateSearch();
    refetchOrganizations();
    refetchTeams();
  };

  return (
    <Layout title="Team List">
      <ErrorMessage>{error?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form<ITeamInsert>
          inputs={[
            {
              type: "hidden",
              name: "organizationId",
              value: selectedOrganizationId,
            },
            { type: "text", name: "name", placeholder: "Add a new team..." },
          ]}
          validationSchema={createValidationSchema}
          disabled={!selectedOrganizationId}
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
                  options={[{ label: `All My Teams`, value: undefined }, ...organizationOptions]}
                  onChange={(value) => {
                    handleSuccess();
                    setSelectedOrganizationId(value);
                  }}
                />
              </div>
            </>
          }
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {teams &&
          teams.map((team) => (
            <TeamCard key={team.id} team={team} onChat={handleChat} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
      </CardGrid>

      <Modal title="Editing a Team" isOpen={isEditModelOpen && !!teamForEdit} onClose={handleCloseEditModal}>
        <Form<ITeamUpdate>
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
                  handleDelete(teamForEdit!.id);
                }}
              >
                Delete
              </Button>
            </div>
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
                onChange={setSearchQuery}
                onSelect={(value) => {
                  setSelectedMemberId(value);
                }}
              />
            )}
            {selectedMemberId && (
              <div className="flex w-full items-end justify-between rounded border border-gray-800 p-2 pl-4">
                {searchOptions.find((o) => o.value === selectedMemberId)?.label}{" "}
                <CloseIconButton
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
              disabled={!selectedMemberId}
              onClick={async () => {
                await onAddMember({
                  userId: selectedMemberId!,
                  teamId: teamForEdit!.id,
                });
                setSelectedMemberId(undefined);
                setSearchQuery(undefined);
                handleSuccess();
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {teamForEdit && teamForEdit.members && (
          <div className="relative mt-4 flex items-center">
            {teamForEdit.members
              .filter((m) => m.id !== teamForEdit?.createdBy?.id)
              .map((m) => (
                <Pill
                  key={m.id}
                  value={m.username}
                  onRemove={async () => {
                    await onRemoveMember({
                      userId: m.id,
                      teamId: teamForEdit.id,
                    });
                  }}
                />
              ))}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          Created by: <span className="font-medium">{teamForEdit?.createdBy?.username}</span>
        </p>
        {teamForEdit?.updatedBy && (
          <p className="mt-2 text-sm text-gray-600">
            Last updated by: <span className="font-medium">{teamForEdit?.updatedBy?.username}</span>
          </p>
        )}
      </Modal>

      <DeleteModal
        title="Deleting a Team"
        itemName={teamForDelete?.name}
        isOpen={isDeleteModelOpen && !!teamForDelete}
        onCancel={() => {
          handleCloseDeleteModal();
        }}
        onDelete={() => {
          const deleted = teamForDelete && onDelete(teamForDelete.id);
          deleted && handleCloseEditModal();
          deleted && handleCloseDeleteModal();
        }}
      >
        <i className="text-red-800">Note: This will delete all todos for this team</i>
      </DeleteModal>

      {teamForChat && (
        <PopOutChatWrapper team={teamForChat} channel={ChannelTypes.TEAM_CHAT} onClose={handleCloseChat} />
      )}
    </Layout>
  );
};
