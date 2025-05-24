import { z } from "zod";

import { ChannelTypes, MessageTypes, PublishMessagePayload } from "@/lib/types";

import { useSocketContext } from "@/providers";

export const usePublicChat = () => {
  const { socket, publish, publicMessages } = useSocketContext();

  const validationSchema = z.object({
    message: z
      .string()
      .min(1, { message: "Must be at least 1 character long." })
      .max(120, { message: "Cannot be more than 120 characters long" }),
  });

  const sendMessage = async ({ message }: { message: string }): Promise<{ message: string }> => {
    return await new Promise((resolve) => {
      publish({
        method: MessageTypes.PUBLISH,
        payload: {
          channel: ChannelTypes.PUBLIC_CHAT,
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
    publicMessages,
  };
};
