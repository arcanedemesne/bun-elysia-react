import React, { ReactNode } from "react";

import { ChatIconButton, DeleteIconButton, EditIconButton, Tooltip } from "@/lib/components";
import { ITeamDTO } from "@/lib/models";

import { CardBase } from "@/components";

type TeamCardProps = {
  team: ITeamDTO;
  onChat: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const TeamCard = ({ team, onChat, onEdit, onDelete, children }: TeamCardProps) => {
  return (
    <CardBase
      title={team.name}
      actionButtons={
        <>
          <Tooltip text="Open Chat">
            <ChatIconButton onClick={() => onChat(team.id)} />
          </Tooltip>
          <Tooltip text="Edit Team">
            <EditIconButton onClick={() => onEdit(team.id)} />
          </Tooltip>
          <Tooltip text="Delete Team">
            <DeleteIconButton onClick={() => onDelete(team.id)} />
          </Tooltip>
        </>
      }
      audits={team}
    >
      <>
        <div className="text-sm text-gray-500">
          {team.todosCount} todo{team.todosCount > 1 ? "s" : ""}
        </div>
        <div className="text-sm text-gray-500">
          {team.members.length} member{team.members.length > 1 ? "s" : ""}
          <Tooltip text={team.members.map((m) => m.username).join(", ")}>
            {team.members.length > 0 && (
              <span className="ml-1 text-xs text-gray-400">
                {team.members
                  .slice(0, 3)
                  .map((m) => m.username)
                  .join(", ")}
                {team.members.length > 3 && " & more"}
              </span>
            )}
          </Tooltip>
        </div>
        {children}
      </>
    </CardBase>
  );
};
