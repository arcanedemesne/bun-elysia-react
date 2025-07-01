import React, { createContext, useContext, useEffect, useState } from "react";

import { IMessageDTO, IUserDTO } from "@/lib/models";
import { showMessage, showToast } from "@/lib/services";
import { ChannelTypes, ISocketRequest, SocketRequestTypes } from "@/lib/types";

import { useUserContext } from "./UserProvider";

const SocketContext = createContext<
  | {
      socket: WebSocket | null;
      subscribe: (channel: string) => void;
      publish: (data: any, callback?: () => void) => void;
      channelPayloads: Map<ChannelTypes, IMessageDTO[]>;
    }
  | undefined
>(undefined);

const getSocketUri = (user: IUserDTO | undefined) => {
  let host, port;
  try {
    host = process.env.HOST;
    port = process.env.SOCKET_PORT;
  } catch {
    console.error("process doesn't exist");
  }
  return `ws://${host}:${port}/ws?userId=${user?.id}&sessionId=${user?.sessionId}`;
};

const handleOnlineStatus = (payload: IMessageDTO) =>
  showToast({
    message: (
      <>
        <b>{payload.createdBy?.username}</b>{" "}
        {payload.organization ? (
          <>
            from organization <b>{payload.organization.name}</b>
          </>
        ) : null}{" "}
        is now <b>{payload.createdBy?.isOnline ? "online" : "offline"}</b>
      </>
    ),
    position: "bottom-right",
  });

export const SocketProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useUserContext();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [channelPayloads, setMessages] = useState<Map<ChannelTypes, IMessageDTO[]>>(
    new Map<ChannelTypes, IMessageDTO[]>(),
  );

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
          default:
            setMessages((prev) => {
              const next = new Map<ChannelTypes, IMessageDTO[]>();
              if (prev?.has(channel)) {
                const m = prev.get(channel) ?? [];
                next.set(channel, [...m, payload]);
              } else {
                next.set(channel, [payload]);
              }
              return next;
            });
            break;
        }
      };

      ws.onclose = () => {
        showMessage({
          message: (
            <>
              Websocket disconnected,{" "}
              <u className="cursor-pointer" onClick={() => window.location.reload()}>
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

  const publish = (data: ISocketRequest, callback?: () => void) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      callback && callback();
    } else {
      console.warn("Not connected to WebSocket server");
    }
  };

  const subscribe = (channel: string) => {
    publish({
      type: SocketRequestTypes.SUBSCRIBE,
      payload: {
        id: crypto.randomUUID(),
        channel,
        message: `Subscribing to channel ${channel}`,
        createdBy: user,
        active: true,
      },
    });
  };

  const contextValue = {
    socket,
    subscribe,
    publish,
    channelPayloads,
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};
