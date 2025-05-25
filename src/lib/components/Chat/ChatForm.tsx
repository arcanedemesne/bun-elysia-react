import React, { useEffect, useRef } from "react";

import { OrganizationDTO, TeamDTO } from "@/lib/models";
import { ChannelTypes, PublishMessagePayload } from "@/lib/types";

import { ChatMessage } from "./ChatMessage";
import { useChat } from "./hooks/useChat";
import { Form } from "@/components";
import { useUserContext } from "@/providers";

export type ChatFormProps = {
  channel: ChannelTypes;
  organization?: OrganizationDTO;
  team?: TeamDTO;
};

export const ChatForm = (props: ChatFormProps) => {
  const { user } = useUserContext();
  const { validationSchema, socket, sendMessage, messages } = useChat(props);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div ref={scrollContainerRef} className="h-full flex-1 overflow-y-auto p-2">
        {messages.map((payload: PublishMessagePayload, index: number) => (
          <ChatMessage
            key={index}
            message={payload.message ?? ""}
            username={payload.user.username}
            timestamp={payload.createdAt}
            isCurrentUser={payload.user.id === user?.id}
          />
        ))}
      </div>
      <div className="mt-4">
        <Form<{ message: string }>
          inputs={[
            {
              type: "textarea",
              name: "message",
              label: "Chat Message",
              placeholder: "Type your message...",
            },
          ]}
          validationSchema={validationSchema}
          onSubmit={sendMessage}
          showCancelButton
          disabled={!socket || socket.readyState !== WebSocket.OPEN}
        />
      </div>
    </>
  );
};
