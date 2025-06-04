import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, memberRoute, organizationRoute } from "@/lib/constants";
import { IOrganizationDTO, IOrganizationInsert, IOrganizationMemberDTO, IOrganizationUpdate } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";
import { organizationNameSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

export const useOrganizations = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = () => {
    const endpoint = `user/${user?.id}`;

    return useQuery<IOrganizationDTO[]>({
      queryKey: ["organizationData", endpoint],
      queryFn: async () => await apiService.get<IOrganizationDTO[]>(`/${apiPrefix}/${organizationRoute}/${endpoint}`),
    });
  };

  const createValidationSchema = z.object({
    name: organizationNameSchema,
    organizationId: z.string().optional(),
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    name: organizationNameSchema,
  });

  const onCreate = async (request: IOrganizationInsert) => {
    ("use server");
    return await apiService.post(`/${apiPrefix}/${organizationRoute}`, request);
  };

  const onEdit = async (request: IOrganizationUpdate) => {
    ("use server");
    return await apiService.put(`/${apiPrefix}/${organizationRoute}/${request.id}`, request);
  };

  const onDelete = async (id: string): Promise<boolean> => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${organizationRoute}/${id}`);

    if (response.status === 200) {
      refetch();
      return true;
    }

    return false;
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["organizationData"] });
    queryClient.refetchQueries({ queryKey: ["organizationData"] });
  };

  const onAddMember = async (organizationMember: IOrganizationMemberDTO) => {
    ("use server");

    const response = await apiService.post(`/${apiPrefix}/${organizationRoute}/${memberRoute}`, organizationMember);

    if (response.status === 200) {
      refetch();
    }
  };

  const onRemoveMember = async (organizationMember: IOrganizationMemberDTO) => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${organizationRoute}/${memberRoute}`, organizationMember);

    if (response.status === 200) {
      refetch();
    }
  };

  return {
    getData: GetData,
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch,
    onAddMember,
    onRemoveMember,
  };
};
