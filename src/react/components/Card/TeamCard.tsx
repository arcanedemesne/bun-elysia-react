import React, { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { apiPrefix, teamRoute } from "../../../constants";
import { TeamDTO } from "../../../types";
import { apiFetch } from "../../api";
import { CardBase } from "./CardBase";
import { DeleteButton, TrashIcon } from "../";

type TeamCardProps = {
  team: TeamDTO;
  children?: ReactNode;
};

export const TeamCard = ({ team, children }: TeamCardProps) => {
  const queryClient = useQueryClient();

  const handleDeleteTeam = async (id: string) => {
    ("use server");

    const response = await apiFetch(`/${apiPrefix}/${teamRoute}/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["teamData"] });
      queryClient.refetchQueries({ queryKey: ["teamData"] });
    } else {
      alert("error");
    }
  };

  return (
    <CardBase>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{team.name}</h3>
        <DeleteButton onDelete={() => handleDeleteTeam(team.id)} />
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
