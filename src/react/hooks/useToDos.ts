import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { ITodoDTO, ITodoInsert, ITodoUpdate } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";
import { optionalUuidSchema, todoTitleSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

export const useTodos = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = ({ organizationId, teamId }: { organizationId?: string | null; teamId?: string | null }) => {
    let endpoint = `user/${user?.id}`;
    if (organizationId) endpoint = `organization/${organizationId}`;
    if (organizationId && teamId) endpoint = `team/${teamId}`;

    return useQuery<ITodoDTO[]>({
      queryKey: ["todoData", endpoint],
      queryFn: async () => await apiService.get<ITodoDTO[]>(`/${apiPrefix}/${todoRoute}/${endpoint}`),
      enabled: !!endpoint,
    });
  };

  const createValidationSchema = z.object({
    title: todoTitleSchema,
    teamId: optionalUuidSchema,
    organizationId: optionalUuidSchema,
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    title: todoTitleSchema,
    teamId: optionalUuidSchema,
    organizationId: optionalUuidSchema,
    description: z.string().optional().nullable(),
  });

  const onCreate = async (request: ITodoInsert) => {
    ("use server");
    if (request.organizationId === "") {
      delete request.organizationId;
    }
    if (request.teamId === "") {
      delete request.teamId;
    }
    return await apiService.post(`/${apiPrefix}/${todoRoute}`, request);
  };

  const onEdit = async (request: ITodoUpdate) => {
    ("use server");
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
