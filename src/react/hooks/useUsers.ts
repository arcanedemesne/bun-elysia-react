import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPrefix, userRoute } from "../../constants";
import { apiFetch } from "../api";
import { UserDTO } from "../../types";

export const useUsers = () => {
  const queryClient = useQueryClient();

  const getData = (search?: string) => {
    const queryString = search ? `search=${search}` : "";
    return useQuery<UserDTO[]>({
      queryKey: ["userData"],
      queryFn: () => apiFetch(`/${apiPrefix}/${userRoute}?${queryString}`),
    });
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["userData"] });
    queryClient.refetchQueries({ queryKey: ["userData"] });
  };

  return {
    getData,
    refetch,
  };
};
