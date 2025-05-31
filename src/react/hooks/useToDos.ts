import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { ITodoInsert, ITodoUpdate, TodoDTO } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";
import { optionalTeamIdSchema, todoTitleSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

export const useTodos = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = ({ organizationId, teamId }: { organizationId?: string | null; teamId?: string | null }) => {
    let endpoint = `user/${user?.id}`;
    if (organizationId) endpoint = `organization/${organizationId}`;
    if (teamId) endpoint = `team/${teamId}`;

    return useQuery<TodoDTO[]>({
      queryKey: ["todoData", endpoint],
      queryFn: async () => await apiService.get<TodoDTO[]>(`/${apiPrefix}/${todoRoute}/${endpoint}`),
      enabled: !!endpoint,
    });
  };

  const createValidationSchema = z.object({
    title: todoTitleSchema,
    teamId: optionalTeamIdSchema,
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    title: todoTitleSchema,
    teamId: optionalTeamIdSchema,
    description: z.string().optional().nullable(),
  });

  const onCreate = async (request: ITodoInsert) => {
    if (request.organizationId === "") {
      delete request.organizationId;
    }
    if (request.teamId === "") {
      delete request.teamId;
    }
    return await apiService.post(`/${apiPrefix}/${todoRoute}`, request);
  };

  const onEdit = async (request: ITodoUpdate) => {
    if (request.teamId === "") {
      delete request.teamId;
    }
    return await apiService.put(`/${apiPrefix}/${todoRoute}/${request.id}`, request);
  };

  const onDelete = async (id: string) => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${todoRoute}/${id}`);

    if (response.status === 200) {
      refetch();
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["todoData"] });
    queryClient.refetchQueries({ queryKey: ["todoData"] });
  };

  return {
    getData: GetData,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch,
  };
};
