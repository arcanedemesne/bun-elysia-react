import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiPrefix, userRoute } from "@/lib/constants";
import { UserDTO } from "@/lib/models";

import { apiFetch } from "@/api";

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

  const GetData = () => {
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
    getData: GetData,
    refetch,
  };
};
