import React from "react";

import { ChatForm } from "@/lib/components";
import { ChannelTypes } from "@/lib/types";

export const Chats = () => {
  return (
    <div className="flex h-[calc(100vh-60px)] flex-col bg-gray-50 p-4">
      <h4 className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-600">Chats (Public for now)</h4>
      <ChatForm channel={ChannelTypes.PUBLIC_CHAT} />
    </div>
  );
};
