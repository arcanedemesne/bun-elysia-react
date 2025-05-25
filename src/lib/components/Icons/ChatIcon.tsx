import React from "react";

export const ChatIcon = ({ isTyping }: { isTyping?: boolean }) => (
  <svg className="mt-1" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 15V4C21 3.44772 20.5523 3 20 3H4C3.44772 3 3 3.44772 3 4V15C3 15.5523 3.44772 16 4 16H18.5L21 18.5V16C21 15.5523 20.5523 15 20 15H21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {isTyping && (
      <>
        <circle cx="8" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="16" cy="10" r="1" fill="currentColor" />
      </>
    )}
  </svg>
);
