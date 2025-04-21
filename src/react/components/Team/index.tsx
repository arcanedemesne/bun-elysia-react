"use client";

import React, {
  ChangeEvent,
  useActionState,
  useRef,
  useState,
} from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { Team } from "../../../types/Team/Team";
import { TeamInsert } from "../../../types/Team/TeamInsert";
import { UserDTO } from "../../../types/User/UserDTO";
import usePersistentForm from "../../hooks/usePersistentForm";
import { apiPrefix, teamRoute } from "../../../constants";
import useAuthCheck from "../../hooks/useCheckAuth";
import { apiFetch } from "../../api";

type TeamPageProps = {
  user: UserDTO;
};

const TeamPage = ({ user }: TeamPageProps) => {
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
    queryKey: ["teamData", user.id],
    queryFn: () =>
      apiFetch(`/${apiPrefix}/${teamRoute}?userId=${user.id}`),
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
      queryClient.invalidateQueries({ queryKey: ["teamData", user.id] });
      queryClient.refetchQueries({ queryKey: ["teamData", user.id] });
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

  const handleDeleteTeam = async (id: string) => {
    ("use server");

    const response = await apiFetch(`/${apiPrefix}/${teamRoute}/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["teamData", user.id] });
      queryClient.refetchQueries({ queryKey: ["teamData", user.id] });
    } else {
      alert("error");
    }
  };

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full rounded bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-bold">Team List</h1>

        {errorMessage && (
          <div className="mt-2 flex items-center text-sm text-red-500">
            <span>{errorMessage}</span>
          </div>
        )}

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
                className="ml-2 cursor-pointer rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
              >
                Add
              </button>
            </div>
          </form>
        </div>

        {error && "An error has occurred: " + error.message}

        {isGetPending && "Loading..."}

        <ul>
          {teams?.length > 0 &&
            teams.map((team: Team) => {
              return (
                <li
                  key={team.id}
                  className="flex items-center justify-between border-b p-3"
                >
                  {team.name} ({team.createdBy})
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="cursor-pointer text-red-500 hover:text-red-700"
                    disabled={isPending}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default TeamPage;
