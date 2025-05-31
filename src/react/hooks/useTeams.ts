import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, memberRoute, teamRoute } from "@/lib/constants";
import { ITeamInsert, ITeamUpdate, TeamDTO, TeamMemberDTO } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";
import { teamNameSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

export const useTeams = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = (organizationId?: string) => {
    let endpoint = `user/${user?.id}`;
    if (organizationId) endpoint = `organization/${organizationId}`;

    return useQuery<TeamDTO[]>({
      queryKey: ["teamData", endpoint],
      queryFn: async () => await apiService.get<TeamDTO[]>(`/${apiPrefix}/${teamRoute}/${endpoint}`),
    });
  };

  const createValidationSchema = z.object({
    name: teamNameSchema,
    organizationId: uuidSchema,
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    name: teamNameSchema,
  });

  const onCreate = async (request: ITeamInsert) => {
    return await apiService.post(`/${apiPrefix}/${teamRoute}`, request);
  };

  const onEdit = async (request: ITeamUpdate) => {
    return await apiService.put(`/${apiPrefix}/${teamRoute}/${request.id}`, request);
  };

  const onDelete = async (id: string): Promise<boolean> => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${teamRoute}/${id}`);

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

    const response = await apiService.post(`/${apiPrefix}/${teamRoute}/${memberRoute}`, teamMember);

    if (response.status === 200) {
      refetch();
    }
  };

  const onRemoveMember = async (teamMember: TeamMemberDTO) => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${teamRoute}/${memberRoute}`, teamMember);

    if (response.status === 200) {
      refetch();
    }
  };

  return {
    getData: GetData,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch,
    onAddMember,
    onRemoveMember,
  };
};
