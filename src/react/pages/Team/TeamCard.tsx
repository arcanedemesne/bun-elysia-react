import React, { ReactNode } from "react";

import { ChatIconButton, DeleteIconButton, EditIconButton } from "@/lib/components";
import { ITeamDTO } from "@/lib/models";

import { CardBase } from "@/components";

type TeamCardProps = {
  team: ITeamDTO;
  showChat?: boolean;
  onChat: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const TeamCard = ({ team, showChat = false, onChat, onEdit, onDelete, children }: TeamCardProps) => {
  return (
    <CardBase>
      <div className="flex items-center justify-between">
        <h3 className="flex justify-start text-lg font-semibold text-gray-800">{team.name}</h3>
        <div className="flex justify-end space-x-2">
          {showChat && <ChatIconButton onClick={() => onChat(team.id)} />}
          <EditIconButton onClick={() => onEdit(team.id)} />
          <DeleteIconButton onClick={() => onDelete(team.id)} />
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {team.todosCount} todo{team.todosCount > 1 ? "s" : ""}
      </div>
      <div title={team.members.map((m) => m.username).join(", ")} className="text-sm text-gray-500">
        {team.members.length} member{team.members.length > 1 ? "s" : ""}:
        {team.members.length > 0 && (
          <span className="ml-1 text-xs text-gray-400">
            {team.members
              .slice(0, 3)
              .map((m) => m.username)
              .join(", ")}
            {team.members.length > 3 && " & more"}
          </span>
        )}
      </div>
      {children}
      <p className="mt-1 text-sm text-gray-600">
        Created by: <span className="font-medium">{team.createdBy?.username}</span>
      </p>
      {team.updatedBy && (
        <p className="mt-1 text-sm text-gray-600">
          Last updated by: <span className="font-medium">{team.updatedBy?.username}</span>
        </p>
      )}
    </CardBase>
  );
};
