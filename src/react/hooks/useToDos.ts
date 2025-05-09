import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { TodoDTO, TodoInsertDTO, TodoUpdateDTO } from "@/lib/models";
import { todoTitleSchema, uuidSchema } from "@/lib/validation";

import { ApiService } from "@/api";
import { useUserContext } from "@/providers";

export const useTodos = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = (teamId?: string) => {
    const queryString = teamId ? `teamId=${teamId}` : `userId=${user?.id}`;
    return useQuery<TodoDTO[]>({
      queryKey: ["todoData", queryString],
      queryFn: async () =>
        await apiService.get<TodoDTO[]>(
          `/${apiPrefix}/${todoRoute}?${queryString}`,
        ),
      enabled: !!queryString,
    });
  };

  const createValidationSchema = z.object({
    title: todoTitleSchema,
    teamId: uuidSchema.optional(),
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    title: todoTitleSchema,
    teamId: uuidSchema.optional(),
    description: z.string().optional().nullable(),
  });

  const onCreate = async (request: TodoInsertDTO) => {
    return await apiService.post(`/${apiPrefix}/${todoRoute}`, request);
  };

  const onEdit = async (request: TodoUpdateDTO) => {
    return await apiService.put(
      `/${apiPrefix}/${todoRoute}/${request.id}`,
      request,
    );
  };

  const onDelete = async (id: string) => {
    ("use server");

    const response = await apiService.delete(
      `/${apiPrefix}/${todoRoute}/${id}`,
    );

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
