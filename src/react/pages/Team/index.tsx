"use client";

import React, { ChangeEvent, useActionState, useRef, useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { apiPrefix, teamRoute } from "../../../constants";
import { TeamInsert, UserDTO, TeamDTO } from "../../../types";
import { usePersistentForm, useAuthCheck } from "../../hooks";
import { apiFetch } from "../../api";
import { CardGrid, TeamCard, Layout, ErrorMessage } from "../../components";

type TeamPageProps = {
  user: UserDTO;
};

export const TeamPage = ({ user }: TeamPageProps) => {
  const queryClient = useQueryClient();

  useAuthCheck();

  const [output, formAction, isPending] = useActionState<
    string | undefined,
    FormData
  >(async (prev, formData) => {
    await handleFormSubmit(formData);
    return `handleFormSubmit`;
  }, undefined);

  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  usePersistentForm(formRef);

  const {
    isPending: isGetPending,
    error,
    data: teams,
  } = useQuery({
    queryKey: ["teamData"],
    queryFn: () => apiFetch(`/${apiPrefix}/${teamRoute}?userId=${user.id}`),
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string | undefined) => {
      ("use server");

      const newTeam = {
        name,
        createdBy: user.id,
      } as TeamInsert;

      return await apiFetch(`/${apiPrefix}/${teamRoute}`, {
        method: "POST",
        body: JSON.stringify(newTeam),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamData"] });
      queryClient.refetchQueries({ queryKey: ["teamData"] });
      setMessage("");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleFormSubmit = async (formData: FormData) => {
    const name = formData.get("name");

    setErrorMessage("");
    if (name!.length < 6) {
      setErrorMessage("Must be at least 6 characters long.");
      return;
    }

    createTeamMutation.mutate(name?.toString());
  };

  return (
    <Layout title="Team List">
      <ErrorMessage>{errorMessage}</ErrorMessage>

      <div className="mb-4">
        <form action={formAction} ref={formRef}>
          <div className="flex items-center">
            <input
              type="text"
              name="name"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setMessage(e.target.value);
              }}
              placeholder="Add a new team..."
              className="flex-grow rounded-md border px-4 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {error && (
        <ErrorMessage>{`An error has occurred: ${error.message}`}</ErrorMessage>
      )}

      {isGetPending && "Loading..."}

      <CardGrid>
        {teams &&
          teams.map((team: TeamDTO) => <TeamCard key={team.id} team={team} />)}
      </CardGrid>
    </Layout>
  );
};
