/* eslint-disable no-console */
import { Elysia } from "elysia";

import { TeamService, UserService } from "@/server-lib/services";

import { WebSocket } from "ws";

import { ChannelTypes, Message, PublishMessagePayload } from "@/lib/types";

import { TeamSocketDTO, User, UserSocketDTO } from "../lib";

export interface AppState {
  channels: Map<string, Set<WebSocket>>;
  users: Map<string, UserSocketDTO>;
}

const publish = (payload: PublishMessagePayload, ws: any) => {
  const store = sockets.store as AppState;
  if (store.channels.has(payload.channel)) {
    store.channels.get(payload.channel)!.forEach(async (client) => {
      if (client.readyState === WebSocket.OPEN && client !== (ws as unknown as WebSocket)) {
        console.log(`${payload.user.username} has published a message with websocket ${ws.id}`);
        const outgoingSocketUser = store.users.get(ws.id);
        if (outgoingSocketUser) {
          if (
            payload.channel === ChannelTypes.ONLINE_STATUS ||
            payload.channel === ChannelTypes.TEAM_CHAT // TODO: What about Organization and Private chats?
          ) {
            if (payload.team?.id) {
              // TODO: Is there a faster way to do this? There could be millions of user sockets to check?
              const teamService = new TeamService(payload.user.id);
              const teams = await teamService.getByUserId(outgoingSocketUser.id);
              if (teams.map((x) => x.id).includes(payload.team.id)) {
                client.send(JSON.stringify(payload));
              }
            } else {
              console.error(`Payload must contain a teamId`);
            }
          } else {
            client.send(JSON.stringify(payload));
          }
        }
      }
    });
  }
};

const subscribe = (user: UserSocketDTO, channel: string, ws: any) => {
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

  console.log(`${user.username} has subscribed to channel ${channel} with websocket ${ws.id}`);
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
  .state("users", new Map<string, UserSocketDTO>())
  .ws("/ws", {
    open: async (ws) => {
      const { userId, sessionId } = ws.data.query;
      if (userId && sessionId) {
        const userService = new UserService();
        const user = (await userService.getById(userId)) as User;
        if (user?.sessionId !== sessionId) {
          // is logged out
          console.error("Invalid sessionId");
          ws.close(1008, "Invalid session");
        } else {
          // is logged in
          console.log(`${user.username} has connected with websocket ${ws.id}`);
          subscribe(user, ChannelTypes.PUBLIC_CHAT, ws);
          const teamService = new TeamService(user.id);
          const teams = await teamService.getByUserId(userId);
          if (teams.length > 0) {
            subscribe(user, ChannelTypes.TEAM_CHAT, ws);
            subscribe(user, ChannelTypes.ONLINE_STATUS, ws);
            console.log(`${user.username} belongs to teams ${teams.map((x) => x.name).join(", ")}`);
            // TODO: create concept of Organization or Project or something so that we aren't alerted for each team
            teams.forEach((team) => {
              publish(
                {
                  channel: ChannelTypes.ONLINE_STATUS,
                  user: {
                    id: user.id,
                    username: user.username,
                  } as UserSocketDTO,
                  team: {
                    id: team.id,
                    name: team.name,
                  } as TeamSocketDTO,
                  isOnline: true,
                } as PublishMessagePayload,
                ws,
              );
            });
          }
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
                } as UserSocketDTO,
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
          } as UserSocketDTO,
        } as PublishMessagePayload,
        ws,
      );
    },
  })

  .listen(Number(process.env.SOCKET_PORT));

console.log(`🦊 Elysia websocket is running at ${sockets.server?.hostname}:${sockets.server?.port}`);
