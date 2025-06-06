import { useEffect, useState } from "react";

import { IOrganizationMinimalDTO, ITeamMinimalDTO, IUserDTO } from "@/lib/models";
import { ChannelTypes, MessageTypes, PublishMessagePayload } from "@/lib/types";

import { useSocketContext, useUserContext } from "@/providers";

type useChatProps = {
  channel: ChannelTypes;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
  recipient?: IUserDTO;
};

export const useChat = ({ channel, organization, team, recipient }: useChatProps) => {
  const { user } = useUserContext();

  const { socket, publish, channelPayloads } = useSocketContext();

  const [messages, setMessages] = useState<PublishMessagePayload[]>([]);

  useEffect(() => {
    if (channel) {
      const channelMessages = channelPayloads.get(channel) ?? [];
      let filteredMessages: PublishMessagePayload[] = [];
      switch (channel) {
        case ChannelTypes.ORGANIZATION_CHAT:
          filteredMessages = channelMessages?.filter(
            (x) =>
              x.channel === ChannelTypes.ORGANIZATION_CHAT && organization && x.organization?.id === organization.id,
          );
          break;
        case ChannelTypes.TEAM_CHAT:
          filteredMessages = channelMessages?.filter(
            (x) => x.channel === ChannelTypes.TEAM_CHAT && team && x.team?.id === team.id,
          );
          break;
        case ChannelTypes.PRIVATE_CHAT:
          filteredMessages = channelMessages?.filter(
            (x) => x.channel === ChannelTypes.PRIVATE_CHAT && user && x.recipient?.id === user?.id,
          );
          break;
        case ChannelTypes.PUBLIC_CHAT:
          filteredMessages = channelMessages?.filter((x) => x.channel === ChannelTypes.PUBLIC_CHAT);
          break;
        default:
          throw new Error(`nvalid channel ${channel}`);
      }
      setMessages(filteredMessages);
    }
  }, [channel, organization, team, user, channelPayloads]);

  const organizationSocketDTO = organization
    ? ({
        id: organization?.id,
        name: organization?.name,
      } as IOrganizationMinimalDTO)
    : null;

  const teamSocketDTO = team
    ? ({
        id: team?.id,
        name: team?.name,
      } as ITeamMinimalDTO)
    : null;

  const userSocketDTO = recipient
    ? ({
        id: recipient?.id,
        username: recipient?.username,
        isOnline: recipient?.isOnline,
      } as IUserDTO)
    : null;

  const sendMessage = async ({ message }: { message: string }): Promise<{ message: string }> => {
    return await new Promise((resolve) => {
      publish({
        method: MessageTypes.PUBLISH,
        payload: {
          channel,
          organization: organizationSocketDTO,
          team: teamSocketDTO,
          recipient: userSocketDTO,
          message,
        } as PublishMessagePayload,
      });
      resolve({ message });
    });
  };

  return {
    socket,
    sendMessage,
    messages,
  };
};
