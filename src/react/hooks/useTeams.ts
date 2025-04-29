import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPrefix, teamRoute } from "../../constants";
import { apiFetch } from "../api";
import { useUserContext } from "../providers";
import { ValidationError } from "../components";
import { TeamDTO, TeamInsert, TeamUpdate } from "../../types";

export const useTeams = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const { isPending, error, data } = useQuery({
    queryKey: ["teamData"],
    queryFn: () => apiFetch(`/${apiPrefix}/${teamRoute}?userId=${user?.id}`),
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

  const onCreate = async (formData: FormData) => {
    const name = formData.get("name");

    const newTeam = {
      name,
      createdBy: user?.id,
    } as TeamInsert;

    return await apiFetch(`/${apiPrefix}/${teamRoute}`, {
      method: "POST",
      body: JSON.stringify(newTeam),
    });
  };

  const onEdit = async (formData: FormData) => {
    const id = formData.get("id");
    const name = formData.get("name");

    const updatedTeam = {
      id,
      name,
    } as TeamUpdate;

    return await apiFetch(`/${apiPrefix}/${teamRoute}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedTeam),
    });
  };

  const onDelete = async (id: string): Promise<boolean> => {
    ("use server");

    const response = await apiFetch(`/${apiPrefix}/${teamRoute}/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      onSuccess();
      return true;
    }

    return false;
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["teamData"] });
    queryClient.refetchQueries({ queryKey: ["teamData"] });
  };

  return {
    isPending,
    error,
    teams: data as TeamDTO[],
    validate,
    onCreate,
    onEdit,
    onDelete,
    onSuccess,
  };
};
