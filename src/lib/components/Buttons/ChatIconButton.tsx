import React from "react";

import { ChatIcon } from "@/lib/components";

type ChatIconButtonProps = {
  isTyping?: boolean;
  onClick: () => void;
};

export const ChatIconButton = ({ isTyping, onClick }: ChatIconButtonProps) => {
  return (
    <button onClick={onClick} className="cursor-pointer text-lime-500 hover:text-lime-700 focus:outline-none">
      <ChatIcon isTyping={isTyping} />
    </button>
  );
};
