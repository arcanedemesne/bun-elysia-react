import React, { useEffect, useRef, useState } from "react";

import { IOrganizationDTO, ITeamDTO } from "@/lib/models";
import { ChannelTypes, PublishMessagePayload } from "@/lib/types";

import { CheckBox } from "../Inputs";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "./hooks/useChat";
import { Form } from "@/components";
import { useUserContext } from "@/providers";

export type ChatFormProps = {
  channel: ChannelTypes;
  organization?: IOrganizationDTO;
  team?: ITeamDTO;
};

export const ChatForm = (props: ChatFormProps) => {
  const { user } = useUserContext();
  const { validationSchema, socket, sendMessage, messages } = useChat(props);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [textAreaSubmitOnEnter, setTextAreaSubmitOnEnter] = useState(true);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmitOnEnterCheckChanged = () => {
    setTextAreaSubmitOnEnter((prev) => !prev);
  };

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
              textAreaSubmitOnEnter,
            },
          ]}
          validationSchema={validationSchema}
          onSubmit={sendMessage}
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
