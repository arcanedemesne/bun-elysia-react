import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiPrefix, userRoute } from "@/lib/constants";
import { UserDTO } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";

export const useUsers = () => {
  const apiService = new ApiService();

  const queryClient = useQueryClient();

  const search = async (search?: string): Promise<UserDTO[]> => {
    if (search && search?.length >= 3) {
      const queryString = search ? `search=${search}` : "";
      return await apiService.get<UserDTO[]>(
        `/${apiPrefix}/${userRoute}?${queryString}`,
      );
    }
    return [];
  };

  const GetData = () => {
    return useQuery<UserDTO[]>({
      queryKey: ["userData"],
      queryFn: async () =>
        await apiService.get<UserDTO[]>(`/${apiPrefix}/${userRoute}`),
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
