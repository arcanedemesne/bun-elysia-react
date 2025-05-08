import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, teamMemberRoute, teamRoute } from "@/lib/constants";
import {
  TeamDTO,
  TeamInsertDTO,
  TeamMemberDTO,
  TeamUpdateDTO,
} from "@/lib/models";
import { teamNameSchema, uuidSchema } from "@/lib/validation";

import { ApiService } from "@/api";
import { useUserContext } from "@/providers";

export const useTeams = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = () => {
    const queryString = `userId=${user?.id}`;
    return useQuery<TeamDTO[]>({
      queryKey: ["teamData", queryString],
      queryFn: async () =>
        await apiService.get<TeamDTO[]>(
          `/${apiPrefix}/${teamRoute}?${queryString}`,
        ),
    });
  };

  const createValidationSchema = z.object({
    name: teamNameSchema,
    teamId: z.string().optional(),
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    name: teamNameSchema,
  });

  const onCreate = async (request: TeamInsertDTO) => {
    return await apiService.post(`/${apiPrefix}/${teamRoute}`, request);
  };

  const onEdit = async (request: TeamUpdateDTO) => {
    return await apiService.put(
      `/${apiPrefix}/${teamRoute}/${request.id}`,
      request,
    );
  };

  const onDelete = async (id: string): Promise<boolean> => {
    ("use server");

    const response = await apiService.delete(
      `/${apiPrefix}/${teamRoute}/${id}`,
    );

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

    const response = await apiService.post(
      `/${apiPrefix}/${teamRoute}/${teamMemberRoute}`,
      teamMember,
    );

    if (response.status === 200) {
      refetch();
    }
  };

  const onRemoveMember = async (teamMember: TeamMemberDTO) => {
    ("use server");

    const response = await apiService.delete(
      `/${apiPrefix}/${teamRoute}/${teamMemberRoute}`,
      teamMember,
    );

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
