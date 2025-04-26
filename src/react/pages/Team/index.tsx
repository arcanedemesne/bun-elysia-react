"use client";

import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { apiPrefix, teamRoute } from "../../../constants";
import { TeamInsert, UserDTO, TeamDTO } from "../../../types";
import { useAuthCheck } from "../../hooks";
import { apiFetch } from "../../api";
import {
  CardGrid,
  TeamCard,
  Layout,
  ErrorMessage,
  Form,
  ValidationError,
} from "../../components";

type TeamPageProps = {
  user: UserDTO;
};

export const TeamPage = ({ user }: TeamPageProps) => {
  const queryClient = useQueryClient();

  useAuthCheck();

  const {
    isPending: isGetPending,
    error: fetchError,
    data: teams,
  } = useQuery({
    queryKey: ["teamData"],
    queryFn: () => apiFetch(`/${apiPrefix}/${teamRoute}?userId=${user.id}`),
  });

  const validate = (formData: FormData) => {
    const name = formData.get("name");

    const errors: ValidationError[] = [];
    if (name!.length < 6) {
      errors.push({
        name: "name",
        message: "Must be at least 6 characters long.",
      });
    }

    return errors;
  };

  const onSubmit = async (formData: FormData) => {
    const name = formData.get("name");

    const newTeam = {
      name,
      createdBy: user.id,
    } as TeamInsert;

    return await apiFetch(`/${apiPrefix}/${teamRoute}`, {
      method: "POST",
      body: JSON.stringify(newTeam),
    });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["teamData"] });
    queryClient.refetchQueries({ queryKey: ["teamData"] });
  };

  return (
    <Layout title="Team List">
      <ErrorMessage>{fetchError?.message ?? ""}</ErrorMessage>

      <div className="mb-4">
        <Form
          inputs={[
            { type: "text", name: "name", placeholder: "Add a new team..." },
          ]}
          validate={validate}
          onSubmit={onSubmit}
          onSuccess={onSuccess}
        />
      </div>

      {isGetPending && "Loading..."}

      <CardGrid>
        {teams &&
          teams.map((team: TeamDTO) => <TeamCard key={team.id} team={team} />)}
      </CardGrid>
    </Layout>
  );
};
