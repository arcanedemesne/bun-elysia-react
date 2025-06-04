import React, { ReactNode } from "react";

import { ChatIconButton, DeleteIconButton, EditIconButton } from "@/lib/components";
import { IOrganizationDTO } from "@/lib/models";

import { CardBase } from "@/components";

type OrganizationCardProps = {
  organization: IOrganizationDTO;
  onChat: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const OrganizationCard = ({ organization, onChat, onEdit, onDelete, children }: OrganizationCardProps) => {
  return (
    <CardBase>
      <div className="flex items-center justify-between">
        <h3 className="flex justify-start text-lg font-semibold text-gray-800">{organization.name}</h3>
        <div className="flex justify-end space-x-2">
          <ChatIconButton onClick={() => onChat(organization.id)} />
          <EditIconButton onClick={() => onEdit(organization.id)} />
          <DeleteIconButton onClick={() => onDelete(organization.id)} />
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {organization.teamsCount} team{organization.teamsCount > 1 ? "s" : ""}
      </div>
      <div title={organization.members.map((m) => m.username).join(", ")} className="text-sm text-gray-500">
        {organization.members.length} member{organization.members.length > 1 ? "s" : ""}:
        {organization.members.length > 0 && (
          <span className="ml-1 text-xs text-gray-400">
            {organization.members
              .slice(0, 3)
              .map((m) => m.username)
              .join(", ")}
            {organization.members.length > 3 && " & more"}
          </span>
        )}
      </div>
      {children}
      <p className="mt-1 text-sm text-gray-600">
        Created by: <span className="font-medium">{organization.createdBy?.username}</span>
      </p>
      {organization.updatedBy && (
        <p className="mt-1 text-sm text-gray-600">
          Last updated by: <span className="font-medium">{organization.updatedBy?.username}</span>
        </p>
      )}
    </CardBase>
  );
};
