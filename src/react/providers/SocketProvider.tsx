import React, { createContext, useContext, useEffect, useState } from "react";

import { UserDTO } from "@/lib/models";
import { showMessage, showToast } from "@/lib/services";
import { ChannelTypes, MessageTypes, PublishMessagePayload } from "@/lib/types";

import { useUserContext } from "./UserProvider";

const SocketContext = createContext<
  | {
      socket: WebSocket | null;
      subscribe: (channel: string) => void;
      publish: (data: any, callback?: () => void) => void;
      messages: PublishMessagePayload[];
    }
  | undefined
>(undefined);

const getSocketUri = (user: UserDTO | undefined) => {
  let host, port;
  try {
    host = process.env.HOST;
    port = process.env.SOCKET_PORT;
  } catch {
    console.error("process doesn't exist");
  }
  return `ws://${host}:${port}/ws?userId=${user?.id}&sessionId=${user?.sessionId}`;
};

const handleOnlineStatus = (payload: PublishMessagePayload) =>
  showToast({
    message: (
      <>
        <b>{payload.user.username}</b> is now{" "}
        <b>{payload.isOnline ? "online" : "offline"}</b>
      </>
    ),
    position: "bottom-right",
  });

export const SocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useUserContext();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<PublishMessagePayload[]>([]);

  useEffect(() => {
    if (user?.sessionId) {
      const ws = new WebSocket(getSocketUri(user));

      ws.onopen = () => {
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        const { channel } = payload;

        switch (channel) {
          case ChannelTypes.ONLINE_STATUS:
            handleOnlineStatus(payload);
            break;
          case ChannelTypes.PUBLIC_CHAT:
            setMessages((prev) => [...prev, payload]);
            break;
          default:
            console.warn(`${channel} is a invalid channel type`);
            break;
        }
      };

      ws.onclose = () => {
        showMessage({
          message: (
            <>
              Websocket disconnected,{" "}
              <u
                className="cursor-pointer"
                onClick={() => window.location.reload()}
              >
                refresh app to reconnect
              </u>
              .
            </>
          ),
          type: "error",
        });
        setSocket(null);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return () => {
        ws.close();
      };
    }
  }, [user]);

  const publish = (data: any, callback?: () => void) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      callback && callback();
    } else {
      console.warn("Not connected to WebSocket server");
    }
  };

  const subscribe = (channel: string) => {
    publish({
      method: MessageTypes.SUBSCRIBE,
      payload: { channel, user },
    });
  };

  const contextValue = {
    socket,
    subscribe,
    publish,
    messages,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
