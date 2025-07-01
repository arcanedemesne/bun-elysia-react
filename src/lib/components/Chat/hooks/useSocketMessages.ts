import { useEffect, useState } from "react";

import { IMessageDTO } from "@/lib/models";
import { useSocketContext, useUserContext } from "@/lib/providers";
import { ChannelTypes, ISocketRequest, SocketRequestTypes } from "@/lib/types";

type useSocketMessagesProps = {
  channel: ChannelTypes;
  organizationId?: string;
  teamId?: string;
};
const filterMessages = (
  { channel, organizationId, teamId }: useSocketMessagesProps,
  channelPayloads: Map<ChannelTypes, IMessageDTO[]>,
) => {
  const channelMessages = channelPayloads.get(channel) ?? [];
  let filteredMessages: IMessageDTO[] = [];
  switch (channel) {
    case ChannelTypes.ORGANIZATION_CHAT:
      filteredMessages = channelMessages?.filter(
        (x) => x.channel === channel && organizationId && x.organization?.id === organizationId,
      );
      break;
    case ChannelTypes.TEAM_CHAT:
      filteredMessages = channelMessages?.filter((x) => x.channel === channel && teamId && x.team?.id === teamId);
      break;
    // case ChannelTypes.PRIVATE_CHAT:
    //   filteredMessages = channelMessages?.filter(
    //     (x) => x.channel === channel && recipient && x.recipient?.id === recipient?.id,
    //   );
    //   break;
    case ChannelTypes.PUBLIC_CHAT:
      filteredMessages = channelMessages?.filter((x) => x.channel === channel);
      break;
    default:
      filteredMessages = [];
      break;
  }
  return filteredMessages;
};

export const useSocketMessages = ({ channel, organizationId, teamId }: useSocketMessagesProps) => {
  const { user } = useUserContext();

  const { socket, publish, channelPayloads } = useSocketContext();

  const [messages, setMessages] = useState<IMessageDTO[]>([]);

  useEffect(() => {
    if (channel) {
      setMessages(filterMessages({ channel, organizationId, teamId }, channelPayloads));
    }
  }, [channel, organizationId, teamId, channelPayloads]);

  const sendMessage = async (payload: IMessageDTO): Promise<IMessageDTO> => {
    return await new Promise((resolve) => {
      publish({ type: SocketRequestTypes.PUBLISH, payload } as ISocketRequest);
      resolve(payload);
    });
  };

  const onMarkAllAsRead = async (): Promise<void> => {
    if (channel) {
      const filtered = filterMessages({ channel, organizationId, teamId }, channelPayloads);
      const updatedMessages = filtered.map((m) => ({
        ...m,
        recipients: m.recipients?.map((u) => ({
          ...u,
          isRead: u.isRead ?? u.id === user?.id,
        })),
      }));
      setMessages(updatedMessages);
    }
  };

  return {
    socket,
    sendMessage,
    messages,
    onMarkAllAsRead,
  };
};
