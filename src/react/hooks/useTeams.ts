import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiPrefix, teamMemberRoute, teamRoute } from "@/lib/constants";
import { TeamDTO, TeamInsert, TeamMemberDTO, TeamUpdate } from "@/lib/models";

import { apiFetch } from "@/api";
import { useUserContext } from "@/providers";
import { ValidationError } from "@/components";

export const useTeams = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const getData = () => {
    const queryString = `userId=${user?.id}`;
    return useQuery<TeamDTO[]>({
      queryKey: ["teamData", queryString],
      queryFn: () => apiFetch(`/${apiPrefix}/${teamRoute}?${queryString}`),
    });
  };

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
      refetch();
      return true;
    }

    return false;
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["teamData"] });
    queryClient.refetchQueries({ queryKey: ["teamData"] });
  };

  const onAddMember = async (teamMember: TeamMemberDTO) => {
    ("use server");

    const response = await apiFetch(
      `/${apiPrefix}/${teamRoute}/${teamMemberRoute}`,
      {
        method: "POST",
        body: JSON.stringify(teamMember),
      },
    );

    if (response.status === 200) {
      refetch();
    }
  };

  const onRemoveMember = async (teamMember: TeamMemberDTO) => {
    ("use server");

    const response = await apiFetch(
      `/${apiPrefix}/${teamRoute}/${teamMemberRoute}`,
      {
        method: "DELETE",
        body: JSON.stringify(teamMember),
      },
    );

    if (response.status === 200) {
      refetch();
    }
  };

  return {
    getData,
    validate,
    onCreate,
    onEdit,
    onDelete,
    refetch,
    onAddMember,
    onRemoveMember,
  };
};
