/* eslint-disable no-console */
import { Elysia } from "elysia";

import { UserService } from "@/server-lib/services";

import { WebSocket } from "ws";

import { ChannelTypes, Message, PublishMessagePayload } from "@/lib/types";

import { UserDTO } from "../lib";

export interface AppState {
  channels: Map<string, Set<WebSocket>>;
  users: Map<string, UserDTO>;
}

const publish = (payload: PublishMessagePayload, ws: any) => {
  const store = sockets.store as AppState;
  if (store.channels.has(payload.channel)) {
    store.channels.get(payload.channel)!.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client !== (ws as unknown as WebSocket)
      ) {
        console.log(
          `${payload.user.username} has published a message with websocket ${ws.id}`,
        );
        client.send(JSON.stringify(payload));
      }
    });
  }
};

const subscribe = (user: UserDTO, channel: string, ws: any) => {
  const store = sockets.store as AppState;
  if (!store.channels.has(channel)) {
    store.channels.set(channel, new Set<WebSocket>());
  }

  if (!store.channels.get(channel)!.has(ws)) {
    store.channels.get(channel)!.add(ws as unknown as WebSocket);
  }

  if (!store.users.has(ws.id)) {
    // TODO: remove users old entry
    store.users.set(ws.id, user);
  }

  console.log(
    `${user.username} has subscribed to channel ${channel} with websocket ${ws.id}`,
  );
};

const unsubscribe = (ws: any) => {
  const store = sockets.store as AppState;
  // unsubscribe channels
  store.channels.forEach((subscribers, channel) => {
    if (subscribers.has(ws as unknown as WebSocket)) {
      subscribers.delete(ws as unknown as WebSocket);
      if (subscribers.size === 0) {
        store.channels.delete(channel);
      }
    }
  });
  // remove user
  store.users.delete(ws.id);
};

const sockets = new Elysia()
  .state("channels", new Map<string, Set<WebSocket>>())
  .state("users", new Map<string, UserDTO>())
  .ws("/ws", {
    open: async (ws) => {
      const { userId, sessionId } = ws.data.query;
      if (userId && sessionId) {
        const userService = new UserService();
        const user = await userService.getById(userId);
        if (user?.sessionId !== sessionId) {
          // is logged out
          console.error("Invalid sessionId");
          ws.close(1008, "Invalid session");
        } else {
          console.log(`${user.username} has connected with websocket ${ws.id}`);
          // is logged in
          subscribe(user, ChannelTypes.ONLINE_STATUS, ws);
          subscribe(user, ChannelTypes.PUBLIC_CHAT, ws);
          publish(
            {
              channel: ChannelTypes.ONLINE_STATUS,
              isOnline: true,
              user: {
                id: user.id,
                username: user.username,
              } as UserDTO,
            } as PublishMessagePayload,
            ws,
          );
        }
      } else {
        console.error("No sessionId provided");
        ws.close(1008, "Authentication required");
      }
    },
    message: async (ws, message: Message) => {
      try {
        const store = sockets.store as AppState;
        const { method, payload } = message;

        const user = store.users.get(ws.id);
        if (user) {
          if (method === "subscribe") {
            const { channel } = payload as any;
            subscribe(user, channel, ws);
          } else if (method === "publish") {
            const publishPayload = payload as PublishMessagePayload;
            publish(
              {
                ...publishPayload,
                user: {
                  id: user.id,
                  username: user.username,
                } as UserDTO,
                createdAt: new Date(),
              } as PublishMessagePayload,
              ws,
            );
          }
        } else {
          console.error("Orphaned websocket, closing");
          ws.close(1008, "Orphaned websocket, closing");
        }
      } catch (error) {
        console.error("Failed to parse or handle message:", error);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    },
    close: (ws) => {
      const store = sockets.store as AppState;
      const user = store.users.get(ws.id);
      console.log(`${user?.username} has closed websocket ${ws.id}`);
      unsubscribe(ws);
      publish(
        {
          channel: ChannelTypes.ONLINE_STATUS,
          isOnline: false,
          user: {
            id: user?.id,
            username: user?.username,
          } as UserDTO,
        } as PublishMessagePayload,
        ws,
      );
    },
  })

  .listen(Number(process.env.SOCKET_PORT));

console.log(
  `🦊 Elysia websocket is running at ${sockets.server?.hostname}:${sockets.server?.port}`,
);
