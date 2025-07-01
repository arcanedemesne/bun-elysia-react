import React, { useEffect, useState } from "react";

import { CheckBox, DownArrowIcon, Form } from "@/lib/components";
import { IMessageDTO, IMessageInsert } from "@/lib/models";
import { useUserContext } from "@/lib/providers";
import { ChannelTypes } from "@/lib/types";

import { ChatMessage } from "./ChatMessage";
import { useChat } from "./hooks/useChat";

export type ChatFormProps = {
  channel: ChannelTypes;
  organizationId?: string;
  teamId?: string;
  isMinimized?: boolean;
  setHasNewMessages?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ChatForm = ({ channel, organizationId, teamId, setHasNewMessages }: ChatFormProps) => {
  const { user } = useUserContext();
  const {
    socket,
    isLoading,
    hasUnreadMessages,
    storedMessages,
    socketMessages,
    scrollContainerRef,
    createValidationSchema,
    handleCreate,
    handleSuccess,
    handleLoadPreviousMessages,
    handleViewUnreadMessages,
    handleMarkAllAsRead,
  } = useChat({ channel, organizationId, teamId });

  const [textAreaSubmitOnEnter, setTextAreaSubmitOnEnter] = useState(true);

  useEffect(() => {
    setHasNewMessages && setHasNewMessages(hasUnreadMessages);
  }, [hasUnreadMessages, setHasNewMessages]);

  const handleSubmitOnEnterCheckChanged = () => {
    setTextAreaSubmitOnEnter((prev) => !prev);
  };

  return (
    <>
      <div ref={scrollContainerRef} className="h-full flex-1 overflow-y-auto p-2">
        {isLoading && <>Loading previous messages...</>}
        {storedMessages && storedMessages.length > 0 && (
          <div className="flex w-full flex-col">
            <div
              className="cursor-pointer self-center rounded-sm text-sm font-semibold text-gray-400 hover:text-gray-600 hover:underline"
              onClick={handleLoadPreviousMessages}
            >
              Load previous messages
            </div>
          </div>
        )}
        {storedMessages?.map((message: IMessageDTO, index: number) => (
          <ChatMessage
            key={`stored-messages-${index}`}
            message={message.message ?? ""}
            username={message.createdBy?.username ?? "unkown person"}
            timestamp={message.createdAt}
            isCurrentUser={message.createdBy?.id === user?.id}
          />
        ))}
        {socketMessages
          .filter((x) => !storedMessages?.map((sm) => sm.id).includes(x.id))
          .map((payload: IMessageDTO, index: number) => (
            <ChatMessage
              key={`chat-messages-${index}`}
              message={payload.message ?? ""}
              username={payload.createdBy?.username ?? "unknown user"}
              timestamp={payload.createdAt}
              isCurrentUser={payload.createdBy?.id === user?.id}
            />
          ))}
      </div>
      {hasUnreadMessages && (
        <div className="border-1 absolute bottom-44 z-10 flex cursor-pointer self-center rounded-sm border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-gray-600 hover:text-gray-800">
          <span className="mr-2" onClick={handleViewUnreadMessages}>
            New Messages
          </span>
          <DownArrowIcon />
        </div>
      )}
      <div className="mt-4">
        <Form<IMessageInsert>
          inputs={[
            {
              type: "textarea",
              name: "message",
              label: "Chat Message",
              placeholder: "Type your message...",
              textAreaSubmitOnEnter,
              onFocus: handleMarkAllAsRead,
            },
          ]}
          validationSchema={createValidationSchema}
          onSubmit={handleCreate}
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
