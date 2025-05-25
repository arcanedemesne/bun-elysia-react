import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, organizationMemberRoute, organizationRoute } from "@/lib/constants";
import { OrganizationDTO, OrganizationInsertDTO, OrganizationMemberDTO, OrganizationUpdateDTO } from "@/lib/models";
import { ApiService } from "@/lib/services/ApiService";
import { organizationNameSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

export const useOrganizations = () => {
  const apiService = new ApiService();

  const { user } = useUserContext();
  const queryClient = useQueryClient();

  const GetData = () => {
    const queryString = `userId=${user?.id}`;
    return useQuery<OrganizationDTO[]>({
      queryKey: ["organizationData", queryString],
      queryFn: async () => await apiService.get<OrganizationDTO[]>(`/${apiPrefix}/${organizationRoute}?${queryString}`),
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

  const onCreate = async (request: OrganizationInsertDTO) => {
    return await apiService.post(`/${apiPrefix}/${organizationRoute}`, request);
  };

  const onEdit = async (request: OrganizationUpdateDTO) => {
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

  const onAddMember = async (organizationMember: OrganizationMemberDTO) => {
    ("use server");

    const response = await apiService.post(
      `/${apiPrefix}/${organizationRoute}/${organizationMemberRoute}`,
      organizationMember,
    );

    if (response.status === 200) {
      refetch();
    }
  };

  const onRemoveMember = async (organizationMember: OrganizationMemberDTO) => {
    ("use server");

    const response = await apiService.delete(
      `/${apiPrefix}/${organizationRoute}/${organizationMemberRoute}`,
      organizationMember,
    );

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
