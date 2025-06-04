import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiPrefix, userRoute } from "@/lib/constants";
import { IUserDTO } from "@/lib/models";
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
  }): Promise<IUserDTO[]> => {
    if (searchQuery && searchQuery?.length >= 3) {
      const searchQueryString = searchQuery ? `searchQuery=${searchQuery}` : null;
      const organizationString = organizationId ? `organizationId=${organizationId}` : null;
      return await apiService.get<IUserDTO[]>(
        `/${apiPrefix}/${userRoute}/search?${searchQueryString}&${organizationString}`,
      );
    }
    return [];
  };

  const GetData = () => {
    return useQuery<IUserDTO[]>({
      queryKey: ["userData"],
      queryFn: async () => await apiService.get<IUserDTO[]>(`/${apiPrefix}/${userRoute}`),
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
