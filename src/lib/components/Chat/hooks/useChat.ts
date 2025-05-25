import { useEffect, useState } from "react";

import { z } from "zod";

import { OrganizationDTO, OrganizationSocketDTO, TeamDTO, TeamSocketDTO } from "@/lib/models";
import { ChannelTypes, MessageTypes, PublishMessagePayload } from "@/lib/types";

import { useSocketContext } from "@/providers";

type useChatProps = {
  channel?: ChannelTypes;
  organization?: OrganizationDTO;
  team?: TeamDTO;
};

export const useChat = ({ organization, team, channel }: useChatProps) => {
  const { socket, publish, channelPayloads } = useSocketContext();

  const [messages, setMessages] = useState<PublishMessagePayload[]>([]);

  useEffect(() => {
    if (channel) {
      const channelMessages = channelPayloads.get(channel) ?? [];
      let filteredMessages: PublishMessagePayload[] = [];
      if (organization) {
        // Organization messages
        filteredMessages = channelMessages?.filter((x) => x.organization?.id === organization.id);
      } else if (team) {
        // Team messages
        filteredMessages = channelMessages?.filter((x) => x.team?.id === team.id);
      } else {
        // Public messages (or Private messages, soon?)
        filteredMessages = channelMessages;
      }
      setMessages(filteredMessages);
    }
  }, [channel, organization, team, channelPayloads]);

  const validationSchema = z.object({
    message: z
      .string()
      .min(1, { message: "Must be at least 1 character long." })
      .max(120, { message: "Cannot be more than 120 characters long" }),
  });

  const organizationSocketDTO = organization
    ? ({
        id: organization?.id,
        name: organization?.name,
      } as OrganizationSocketDTO)
    : null;

  const teamSocketDTO = team
    ? ({
        id: team?.id,
        name: team?.name,
      } as TeamSocketDTO)
    : null;

  const sendMessage = async ({ message }: { message: string }): Promise<{ message: string }> => {
    return await new Promise((resolve) => {
      publish({
        method: MessageTypes.PUBLISH,
        payload: {
          channel,
          organization: organizationSocketDTO,
          team: teamSocketDTO,
          message,
        } as PublishMessagePayload,
      });
      resolve({ message });
    });
  };

  return {
    validationSchema,
    socket,
    sendMessage,
    messages,
  };
};
