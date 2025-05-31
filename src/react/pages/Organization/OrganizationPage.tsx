import React, { MouseEvent, useEffect, useState } from "react";

import {
  Button,
  ButtonModes,
  CloseIconButton,
  DeleteModal,
  ErrorMessage,
  Label,
  Modal,
  Pill,
  TypeAheadSearchInput,
  TypeAheadSearchOption,
} from "@/lib/components";
import { PopOutChatWrapper } from "@/lib/components/Chat/PopOutChatWrapper";
import { IOrganizationInsert, IOrganizationUpdate } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { OrganizationCard } from "./OrganizationCard";
import { CardGrid, Form, Layout } from "@/components";
import { useAuthCheck, useOrganizations, useUsers } from "@/hooks";

export const OrganizationPage = () => {
  useAuthCheck();

  const [isEditModelOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const [isDeleteModelOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [searchOptions, setSearchOptions] = useState<TypeAheadSearchOption[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const {
    getData: getOrganizations,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch: refetchOrganizations,
    onAddMember,
    onRemoveMember,
  } = useOrganizations();

  const { isPending, error, data: organizations } = getOrganizations();

  const organizationForEdit = organizations && organizations.find((t) => t.id === editId);
  const organizationForDelete = organizations && organizations.find((t) => t.id === deleteId);
  const organizationForChat = organizations && organizations.find((t) => t.id === chatId);

  const { search } = useUsers();

  useEffect(() => {
    const fetchData = async () => {
      const foundMembers = await search({ searchQuery });

      const searchOptions =
        foundMembers && foundMembers.length > 0
          ? foundMembers
              .filter((fm) => !organizationForEdit?.members.map((m) => m.id).includes(fm.id))
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
    refetchOrganizations();
  };

  return (
    <Layout title="Organization List">
      <ErrorMessage>{error?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form<IOrganizationInsert>
          inputs={[{ type: "text", name: "name", placeholder: "Add a new organization..." }]}
          validationSchema={createValidationSchema}
          onSubmit={onCreate}
          onSuccess={handleSuccess}
          submitButtonText="Add"
          showCancelButton
        />
      </div>

      {isPending && "Loading..."}

      <CardGrid>
        {organizations &&
          organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              onChat={handleChat}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
      </CardGrid>

      <Modal
        title="Editing an Organization"
        isOpen={isEditModelOpen && !!organizationForEdit}
        onClose={handleCloseEditModal}
      >
        <Form<IOrganizationUpdate>
          inputs={[
            {
              type: "hidden",
              name: "id",
              value: organizationForEdit?.id,
            },
            {
              type: "text",
              name: "name",
              label: "Organization Name",
              placeholder: "Add a organization name...",
              value: organizationForEdit?.name,
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
                  handleDelete(organizationForEdit!.id);
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
                  organizationId: organizationForEdit!.id,
                });
                setSelectedMemberId(undefined);
                setSearchQuery(undefined);
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {organizationForEdit && organizationForEdit.members && (
          <div className="relative mt-4 flex items-center">
            {organizationForEdit.members
              .filter((m) => m.id !== organizationForEdit?.createdBy?.id)
              .map((m) => (
                <Pill
                  key={m.id}
                  value={m.username}
                  onRemove={async () => {
                    await onRemoveMember({
                      userId: m.id,
                      organizationId: organizationForEdit.id,
                    });
                  }}
                />
              ))}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600">
          Created by: <span className="font-medium">{organizationForEdit?.createdBy?.username}</span>
        </p>
        {organizationForEdit?.updatedBy && (
          <p className="mt-2 text-sm text-gray-600">
            Last updated by: <span className="font-medium">{organizationForEdit?.updatedBy?.username}</span>
          </p>
        )}
      </Modal>

      <DeleteModal
        title="Deleting a Organization"
        itemName={organizationForDelete?.name}
        isOpen={isDeleteModelOpen && !!organizationForDelete}
        onCancel={() => {
          handleCloseDeleteModal();
        }}
        onDelete={() => {
          const deleted = organizationForDelete && onDelete(organizationForDelete.id);
          deleted && handleCloseEditModal();
          deleted && handleCloseDeleteModal();
        }}
      >
        <i className="text-red-800">Note: This will delete all teams & todos for this organization</i>
      </DeleteModal>

      {organizationForChat && (
        <PopOutChatWrapper
          organization={organizationForChat}
          channel={ChannelTypes.ORGANIZATION_CHAT}
          onClose={handleCloseChat}
        />
      )}
    </Layout>
  );
};
