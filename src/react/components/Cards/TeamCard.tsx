import React, { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { TeamDTO } from "../../../types";
import { CardBase } from "./CardBase";
import { DeleteButton, EditButton, TrashIcon } from "..";

type TeamCardProps = {
  team: TeamDTO;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  children?: ReactNode;
};

export const TeamCard = ({
  team,
  onEdit,
  onDelete,
  children,
}: TeamCardProps) => {
  const queryClient = useQueryClient();

  return (
    <CardBase>
      <div className="flex items-center justify-between">
        <h3 className="flex justify-start text-lg font-semibold text-gray-800">
          {team.name}
        </h3>
        <div className="flex justify-end space-x-2">
          <EditButton onClick={() => onEdit(team.id)} />
          <DeleteButton onClick={() => onDelete(team.id)} />
        </div>
      </div>
      <p className="mb-1 text-sm text-gray-600">
        Created by:{" "}
        <span className="font-medium">{team.createdBy.username}</span>
      </p>
      <div className="text-sm text-gray-500">{team.todos} ToDo(s)</div>
      <div
        title={team.members.map((m) => m.username).join(", ")}
        className="text-sm text-gray-500"
      >
        {team.members.length} Member(s):
        {team.members.length > 0 && (
          <span className="ml-1 text-xs text-gray-400">
            {team.members
              .slice(0, 3)
              .map((m) => m.username)
              .join(", ")}
            {team.members.length > 3 && ", ..."}
          </span>
        )}
      </div>
      {children}
    </CardBase>
  );
};
