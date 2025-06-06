import React, { useEffect, useRef, useState } from "react";

import { IMessage, IMessageDTO, IMessageInsert, IOrganizationMinimalDTO, ITeamMinimalDTO } from "@/lib/models";
import { ChannelTypes, PublishMessagePayload } from "@/lib/types";

import { CheckBox } from "../Inputs";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "./hooks/useChat";
import { useMessages } from "./hooks/useMessages";
import { Form } from "@/components";
import { useUserContext } from "@/providers";

export type ChatFormProps = {
  channel: ChannelTypes;
  organization?: IOrganizationMinimalDTO;
  team?: ITeamMinimalDTO;
};

export const ChatForm = ({ channel, organization, team }: ChatFormProps) => {
  const { user } = useUserContext();
  const { socket, sendMessage, messages } = useChat({ channel, organization, team });

  const { createValidationSchema, getData, onCreate } = useMessages({ channel, organization, team });

  const { data: storedMessages, isLoading } = getData({
    organizationId: organization?.id,
    teamId: team?.id,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endOfContentRef = useRef<HTMLDivElement>(null);

  const [textAreaSubmitOnEnter, setTextAreaSubmitOnEnter] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        const maxScrollTop = scrollHeight - clientHeight;
        scrollContainerRef.current?.scrollTo({
          top: maxScrollTop,
          behavior: "smooth",
        });
      }
    }, 100);
  }, [storedMessages, messages]);

  const handleSubmitOnEnterCheckChanged = () => {
    setTextAreaSubmitOnEnter((prev) => !prev);
  };

  const handleSuccess = async (response: IMessage) => {
    sendMessage(response);
  };

  return (
    <>
      <div ref={scrollContainerRef} className="h-full flex-1 overflow-y-auto p-2">
        {isLoading && <>Loading previous messages...</>}
        {storedMessages?.map((message: IMessageDTO, index: number) => (
          <ChatMessage
            key={`stored-messages-${index}`}
            message={message.message ?? ""}
            username={message.createdBy?.username ?? "unkown person"}
            timestamp={message.createdAt}
            isCurrentUser={message.createdBy?.id === user?.id}
          />
        ))}
        {messages.map((payload: PublishMessagePayload, index: number) => (
          <ChatMessage
            key={`chat-messages-${index}`}
            message={payload.message ?? ""}
            username={payload.user.username}
            timestamp={payload.createdAt}
            isCurrentUser={payload.user.id === user?.id}
          />
        ))}
        <div ref={endOfContentRef} style={{ height: "0px", overflow: "hidden" }} />
      </div>
      <div className="mt-4">
        <Form<IMessageInsert>
          inputs={[
            {
              type: "textarea",
              name: "message",
              label: "Chat Message",
              placeholder: "Type your message...",
              textAreaSubmitOnEnter,
            },
          ]}
          validationSchema={createValidationSchema}
          onSubmit={onCreate}
          onSuccess={handleSuccess}
          showCancelButton
          secondaryButtons={
            <div style={{ width: "auto" }}>
              <CheckBox
                name="submitOnEnter"
                checked={textAreaSubmitOnEnter}
                onChange={handleSubmitOnEnterCheckChanged}
                label="Submit on enter"
              />
            </div>
          }
          disabled={!socket || socket.readyState !== WebSocket.OPEN}
        />
      </div>
    </>
  );
};
