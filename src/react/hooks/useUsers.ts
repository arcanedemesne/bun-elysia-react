import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPrefix, userRoute } from "../../constants";
import { apiFetch } from "../api";
import { UserDTO } from "../../types";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const search = async (search?: string): Promise<UserDTO[]> => {
    if (search && search?.length >= 3) {
      const queryString = search ? `search=${search}` : "";
      return await apiFetch<UserDTO[]>(
        `/${apiPrefix}/${userRoute}?${queryString}`,
      );
    }
    return [];
  };

  const getUsers = () => {
    return useQuery<UserDTO[]>({
      queryKey: ["userData"],
      queryFn: () => apiFetch(`/${apiPrefix}/${userRoute}`),
    });
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["userData"] });
    queryClient.refetchQueries({ queryKey: ["userData"] });
  };

  return {
    search,
    getUsers,
    refetch,
  };
};
