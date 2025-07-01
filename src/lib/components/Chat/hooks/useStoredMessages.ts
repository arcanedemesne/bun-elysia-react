import { useQuery, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import { apiPrefix, messageRoute } from "@/lib/constants";
import { IMessageDTO, IMessageInsert, IMessageUpdate } from "@/lib/models";
import { useUserContext } from "@/lib/providers";
import { ApiService } from "@/lib/services";
import { ChannelTypes } from "@/lib/types";
import { chatMessageSchema, uuidSchema } from "@/lib/validation";

type useStoredMessagesProps = {
  channel: ChannelTypes;
  organizationId?: string;
  teamId?: string;
};

export const useStoredMessages = ({ channel, organizationId, teamId }: useStoredMessagesProps) => {
  const { user } = useUserContext();

  const queryClient = useQueryClient();

  const apiService = new ApiService();

  const GetData = (
    { organizationId, teamId }: { organizationId?: string | null; teamId?: string | null },
    before?: Date,
  ) => {
    let entityId = user?.id;
    if (organizationId) entityId = organizationId;
    if (organizationId && teamId) entityId = teamId;

    return useQuery<IMessageDTO[]>({
      queryKey: ["storedMessagesData", channel, entityId, before],
      queryFn: async () =>
        await apiService.get<IMessageDTO[]>(
          `/${apiPrefix}/${messageRoute}/channel/${channel}/${entityId}` + (before ? `?before=${before}` : ``),
        ),
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

  const onCreate = async (request: IMessageInsert): Promise<IMessageDTO> => {
    ("use server");

    request = { ...request, channel, organizationId, teamId };
    return await apiService.post<IMessageDTO>(`/${apiPrefix}/${messageRoute}`, request);
  };

  const onEdit = async (request: IMessageUpdate): Promise<IMessageDTO> => {
    ("use server");

    request = { ...request };
    return await apiService.put<IMessageDTO>(`/${apiPrefix}/${messageRoute}/${request.id}`, request);
  };

  const onDelete = async (id: string): Promise<void> => {
    ("use server");

    const response = await apiService.delete(`/${apiPrefix}/${messageRoute}/${id}`);

    if (response.status === 200) {
      refetch();
    }
  };

  const onMarkAllAsRead = async (before: Date): Promise<void> => {
    ("use server");
    let entityId = user?.id;
    if (organizationId) entityId = organizationId;
    if (organizationId && teamId) entityId = teamId;

    await apiService.put<boolean>(
      `/${apiPrefix}/${messageRoute}/channel/${channel}/${entityId}/markAllAsRead` +
        (before ? `?before=${before}` : ``),
    );
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
    onMarkAllAsRead,
    refetch,
  };
};
