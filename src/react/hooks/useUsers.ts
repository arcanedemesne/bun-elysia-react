import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiPrefix, userRoute } from "@/lib/constants";
import { UserDTO } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";

export const useUsers = () => {
  const apiService = new ApiService();

  const queryClient = useQueryClient();

  const search = async ({
    organizationId,
    searchQuery,
  }: {
    organizationId?: string;
    searchQuery?: string;
  }): Promise<UserDTO[]> => {
    if (searchQuery && searchQuery?.length >= 3) {
      const prefix = organizationId ? `organizationId=${organizationId}` : null;
      const queryString = prefix && searchQuery ? `${prefix}&search=${searchQuery}` : "";
      return await apiService.get<UserDTO[]>(`/${apiPrefix}/${userRoute}?${queryString}`);
    }
    return [];
  };

  const GetData = () => {
    return useQuery<UserDTO[]>({
      queryKey: ["userData"],
      queryFn: async () => await apiService.get<UserDTO[]>(`/${apiPrefix}/${userRoute}`),
    });
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["userData"] });
  };

  const refetch = () => {
    invalidate();
    queryClient.refetchQueries({ queryKey: ["userData"] });
  };

  return {
    search,
    getData: GetData,
    invalidate,
    refetch,
  };
};
