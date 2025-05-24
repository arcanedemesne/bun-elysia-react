import React, { useEffect, useRef } from "react";
import { usePublicChat } from "src/react/hooks/usePublicChat";

import { PublishMessagePayload } from "@/lib/types";

import { ChatMessage } from "./ChatMessage";
import { Form } from "@/components";
import { useUserContext } from "@/providers";

export const PublicChat = () => {
  const { user } = useUserContext();
  const { validationSchema, socket, sendMessage, publicMessages } = usePublicChat();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [publicMessages]);

  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-gray-50 p-4">
      <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">Public Chat</h2>
      <div ref={scrollContainerRef} className="h-full flex-1 overflow-y-auto p-2">
        {publicMessages.map((payload: PublishMessagePayload, index: number) => (
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
    </div>
  );
};
