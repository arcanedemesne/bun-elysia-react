import React, { useEffect, useState } from "react";

type ChatMessageProps = {
  message: string;
  username: string;
  timestamp?: Date;
  isCurrentUser?: boolean;
};

const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;

  if (years > 1) result = `${years} years`;
  else if (years === 1) result = `1 year`;
  else if (months > 1) result = `${months} months`;
  else if (months === 1) result = `1 month`;
  else if (days > 1) result = `${days} days`;
  else if (days === 1) result = `1 day`;
  else if (hours > 1) result = `${hours} hours`;
  else if (hours === 1) result = `1 hour`;
  else if (minutes > 1) result = `${minutes} minutes`;
  else if (minutes === 1) result = `1 minute`;
  else if (seconds > 1) result = `${seconds} seconds`;
  else result = "just now";

  if (options?.addSuffix && seconds > 1) {
    return `${result} ago`;
  }
  return result;
};

export const ChatMessage = ({ message, username, timestamp, isCurrentUser = false }: ChatMessageProps) => {
  const [messageAge, setMessageAge] = useState(
    timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : "just now",
  );
  useEffect(() => {
    const timer = setInterval(() => {
      if (timestamp) {
        setMessageAge(formatDistanceToNow(new Date(timestamp), { addSuffix: true }));
      }
    }, 5 * 1000);
    return () => {
      clearInterval(timer);
    };
  }, [timestamp]);

  return (
    <div className={`flex flex-col gap-1 ${isCurrentUser ? "items-end" : "items-start"} mb-2`}>
      <div className={`flex items-center gap-2 ${isCurrentUser ? "justify-end" : "justify-start"} `}>
        <span className={`text-sm font-medium ${isCurrentUser ? "text-gray-800" : "text-gray-500"} `}>
          {isCurrentUser ? "You" : username}
        </span>
      </div>
      <div
        className={`max-w-[70%] whitespace-pre-wrap break-words rounded-xl px-4 py-2 shadow-sm sm:max-w-[50%] md:max-w-[40%] ${
          isCurrentUser
            ? "ml-auto border border-blue-500/50 bg-gray-800 text-white"
            : "mr-auto border border-gray-200/50 bg-gray-200 text-gray-800"
        } `}
      >
        {message}
      </div>
      {messageAge && <span className="text-xs text-gray-400">{messageAge}</span>}
    </div>
  );
};
