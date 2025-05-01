import { useQueryClient, useQuery } from "@tanstack/react-query";

import { apiPrefix, todoRoute } from "@/lib/constants";
import { ToDo, ToDoInsert, ToDoUpdate } from "@/lib/models";

import { apiFetch } from "@/api";
import { ValidationError } from "@/components";
import { useUserContext } from "@/providers";

export const useToDos = () => {
  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const getData = (teamId?: string) => {
    const queryString = teamId ? `teamId=${teamId}` : `userId=${user?.id}`;
    return useQuery<ToDo[]>({
      queryKey: ["todoData", queryString],
      queryFn: async () =>
        await apiFetch(`/${apiPrefix}/${todoRoute}?${queryString}`),
      enabled: !!queryString,
    });
  };

  const validate = (formData: FormData) => {
    const title = formData.get("title");

    const errors: ValidationError[] = [];
    if (title!.length < 6) {
      errors.push({
        name: "title",
        message: "Must be at least 6 characters long.",
      });
    }

    return errors;
  };

  const onCreate = async (formData: FormData) => {
    const teamId = formData.get("teamId");
    const title = formData.get("title");

    const newTodo = {
      title,
      teamId: teamId && teamId?.length > 0 ? teamId : undefined,
      createdBy: user?.id,
    } as ToDoInsert;

    return await apiFetch(`/${apiPrefix}/${todoRoute}`, {
      method: "POST",
      body: JSON.stringify(newTodo),
    });
  };

  const onEdit = async (formData: FormData) => {
    const id = formData.get("id");
    const title = formData.get("title");
    const description = formData.get("description");

    const updatedTodo = {
      id,
      title,
      description,
    } as ToDoUpdate;

    return await apiFetch(`/${apiPrefix}/${todoRoute}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedTodo),
    });
  };

  const onDelete = async (id: string) => {
    ("use server");

    const response = await apiFetch(`/${apiPrefix}/${todoRoute}/${id}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      refetch();
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["todoData"] });
    queryClient.refetchQueries({ queryKey: ["todoData"] });
  };

  return {
    getData,
    validate,
    onCreate,
    onEdit,
    onDelete,
    refetch,
  };
};
