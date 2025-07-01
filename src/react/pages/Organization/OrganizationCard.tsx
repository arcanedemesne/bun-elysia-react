import React, { ReactNode } from "react";

import { ChatIconButton, DeleteIconButton, EditIconButton, Tooltip } from "@/lib/components";
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
    <CardBase
      title={organization.name}
      actionButtons={
        <>
          <Tooltip text="Open Chat">
            <ChatIconButton onClick={() => onChat(organization.id)} />
          </Tooltip>
          <Tooltip text="Edit Organization">
            <EditIconButton onClick={() => onEdit(organization.id)} />
          </Tooltip>
          <Tooltip text="Delete Organization">
            <DeleteIconButton onClick={() => onDelete(organization.id)} />
          </Tooltip>
        </>
      }
      audits={organization}
    >
      <>
        <div className="text-sm text-gray-500">
          {organization.teams.length} team{organization.teams.length > 1 ? "s" : ""}
        </div>
        <div className="text-sm text-gray-500">
          {organization.members.length} member{organization.members.length > 1 ? "s" : ""}
          <Tooltip text={organization.members.map((m) => m.username).join(", ")}>
            {organization.members.length > 0 && (
              <span className="ml-1 text-xs text-gray-400">
                {organization.members
                  .slice(0, 3)
                  .map((m) => m.username)
                  .join(", ")}
                {organization.members.length > 3 && `& ${organization.members.length - 3} more`}
              </span>
            )}
          </Tooltip>
        </div>
        {children}
      </>
    </CardBase>
  );
};
