/* eslint-disable no-console */
import { Elysia } from "elysia";

import { OrganizationService, UserService } from "@/server-lib/services";

import { WebSocket } from "ws";

import { OrganizationSocketDTO, User, UserDTO, UserSocketDTO } from "@/lib/models";
import { ChannelTypes, Message, PublishMessagePayload } from "@/lib/types";

export interface AppState {
  channels: Map<string, Set<WebSocket>>;
  users: Map<string, UserSocketDTO>;
}

const publish = async (payload: PublishMessagePayload, ws: any) => {
  const store = sockets.store as AppState;
  const userService = new UserService();

  const requiresOrganization = (payload.organization && payload.channel === ChannelTypes.ORGANIZATION_CHAT) ?? false;
  const requiresTeam = (payload.team && payload.channel === ChannelTypes.TEAM_CHAT) ?? false;
  let allowedUsers: UserDTO[] = [];

  if (requiresOrganization) {
    allowedUsers = await userService.getByOrganizationIds([payload.organization!.id]);
  } else if (requiresTeam) {
    allowedUsers = await userService.getByTeamIds([payload.team!.id]);
  }

  if (store.channels.has(payload.channel)) {
    store.channels.get(payload.channel)!.forEach(async (client) => {
      if (client.readyState === WebSocket.OPEN && client !== (ws as unknown as WebSocket)) {
        console.log(
          `${payload.user.username} has published a message to channel ${payload.channel} with websocket ${ws.id}`,
        );
        const outgoingSocketUser = store.users.get(ws.id);

        if (outgoingSocketUser) {
          if (
            (payload.channel === ChannelTypes.ONLINE_STATUS || requiresOrganization || requiresTeam) &&
            allowedUsers.map((u) => u.id).includes(outgoingSocketUser.id)
          ) {
            client.send(JSON.stringify(payload));
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
      try {
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
            const organizationService = new OrganizationService(user.id);
            const organizations = await organizationService.getByUserId(userId);
            if (organizations.length > 0) {
              subscribe(user, ChannelTypes.ORGANIZATION_CHAT, ws);
              subscribe(user, ChannelTypes.TEAM_CHAT, ws);
              subscribe(user, ChannelTypes.ONLINE_STATUS, ws);
              console.log(`${user.username} belongs to organizations ${organizations.map((x) => x.name).join(", ")}`);

              organizations.forEach((organization) => {
                publish(
                  {
                    channel: ChannelTypes.ONLINE_STATUS,
                    user: {
                      id: user.id,
                      username: user.username,
                    } as UserSocketDTO,
                    organization: {
                      id: organization.id,
                      name: organization.name,
                    } as OrganizationSocketDTO,
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
      } catch (error) {
        console.error("Error establishing connection:", error);
        ws.send(JSON.stringify({ error: "Error establishing connection" }));
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
