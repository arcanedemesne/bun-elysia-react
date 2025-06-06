import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, messageRoute } from "@/lib/constants";
import {
  IMessageDTO,
  IMessageInsert,
  IMessageUpdate,
  IOrganizationMinimalDTO,
  ITeamMinimalDTO,
  IUserDTO,
} from "@/lib/models";
import { ApiService } from "@/lib/services";
import { ChannelTypes } from "@/lib/types";
import { chatMessageSchema, uuidSchema } from "@/lib/validation";

import { useUserContext } from "@/providers";

type useMessagesProps = {
  channel: ChannelTypes;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  recipient?: IUserDTO;
};

export const useMessages = ({ channel, organization, team, recipient }: useMessagesProps) => {
  const { user } = useUserContext();

  const queryClient = useQueryClient();

  const apiService = new ApiService();

  const GetData = ({ organizationId, teamId }: { organizationId?: string | null; teamId?: string | null }) => {
    let entityId = user?.id;
    if (organizationId) entityId = organizationId;
    if (organizationId && teamId) entityId = teamId;

    return useQuery<IMessageDTO[]>({
      queryKey: ["storedMessagesData", channel, entityId],
      queryFn: async () =>
        await apiService.get<IMessageDTO[]>(`/${apiPrefix}/${messageRoute}/channel/${channel}/${entityId}`),
      enabled: !!channel && !!entityId,
    });
  };

  const createValidationSchema = z.object({
    message: chatMessageSchema,
  });

  const editValidationSchema = z.object({
    id: uuidSchema,
    message: chatMessageSchema,
  });

  const onCreate = async (request: IMessageInsert) => {
    ("use server");

    request = { ...request, channel, organizationId: organization?.id, teamId: team?.id, recipientId: recipient?.id };
    return await apiService.post(`/${apiPrefix}/${messageRoute}`, request);
  };

  const onEdit = async (request: IMessageUpdate) => {
    ("use server");

    request = { ...request, channel, organizationId: organization?.id, teamId: team?.id, recipientId: recipient?.id };
    return await apiService.put(`/${apiPrefix}/${messageRoute}/${request.id}`, request);
  };

  const onDelete = async (id: string) => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${messageRoute}/${id}`);

    if (response.status === 200) {
      refetch();
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["todoData"] });
    queryClient.refetchQueries({ queryKey: ["todoData"] });
  };

  return {
    getData: channel !== ChannelTypes.PUBLIC_CHAT ? GetData : () => ({ data: [], isLoading: false }),
    createValidationSchema,
    editValidationSchema,
    onCreate,
    onEdit,
    onDelete,
    refetch,
  };
};
