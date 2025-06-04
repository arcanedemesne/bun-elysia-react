/* eslint-disable no-console */
import { Elysia } from "elysia";

import { OrganizationService, UserService } from "@/server-lib/services";

import { WebSocket } from "ws";

import { IOrganizationSocketDTO, IUserSocketDTO, User } from "@/lib/models";
import { ChannelTypes, Message, PublishMessagePayload } from "@/lib/types";

export interface AppState {
  channels: Map<string, Set<WebSocket>>;
  users: Map<string, IUserSocketDTO>;
}

const publish = async (payload: PublishMessagePayload, ws: any) => {
  const store = sockets.store as AppState;
  const userService = new UserService(payload.user.id);

  const requiresOrganization = payload.organization ?? false;
  const requiresTeam = payload.team ?? false;
  let allowedUserIds: string[] = [];

  if (requiresOrganization) {
    allowedUserIds = await userService.getByOrganizationIds([payload.organization!.id]);
  } else if (requiresTeam) {
    allowedUserIds = await userService.getByTeamIds([payload.team!.id]);
  }

  const sendPayload = (client: any, payload: PublishMessagePayload) => {
    client.send(JSON.stringify(payload));
  };

  if (store.channels.has(payload.channel)) {
    console.log(`user ${payload.user.username} is attempting to publish a message on channel ${payload.channel}`);
    store.channels.get(payload.channel)!.forEach(async (client: any) => {
      if (client.readyState === WebSocket.OPEN && client !== (ws as unknown as WebSocket)) {
        const outgoingSocketUser = store.users.get(client.id);
        if (outgoingSocketUser) {
          if (payload.channel === ChannelTypes.PUBLIC_CHAT && !requiresOrganization && !requiresTeam) {
            sendPayload(client, payload);
          } else if (allowedUserIds.includes(outgoingSocketUser.id)) {
            sendPayload(client, payload);
          }
        }
      }
    });
  }
};

const subscribe = (user: IUserSocketDTO, channel: string, ws: any) => {
  const store = sockets.store as AppState;

  if (!store.users.has(ws.id)) {
    // delete old connections
    console.log(`deleting ${user.username}'s older connections before establishing a new one`);
    const oldUserWS = store.users.entries().find((x) => x[1].id === user.id);
    oldUserWS && unsubscribe(oldUserWS[0]);
    // set new user entry for websocket
    store.users.set(ws.id, user);
  }

  if (!store.channels.has(channel)) {
    // set new channel
    store.channels.set(channel, new Set<WebSocket>());
    console.log(`New channel ${channel} has been added`);
  }

  if (!store.channels.get(channel)!.has(ws)) {
    // set new websocket entry for channel
    store.channels.get(channel)!.add(ws as unknown as WebSocket);
    console.log(`${user.username} has subscribed to channel ${channel} with websocket ${ws.id}`);
  }
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
  .state("users", new Map<string, IUserSocketDTO>())
  .ws("/ws", {
    open: async (ws) => {
      try {
        const { userId, sessionId } = ws.data.query;
        if (userId && sessionId) {
          const userService = new UserService(userId);
          const user = await userService.getById(userId);
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
                    user: new User(user).toDTO(),
                    organization: {
                      id: organization.id,
                      name: organization.name,
                    } as IOrganizationSocketDTO,
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
                } as IUserSocketDTO,
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
          } as IUserSocketDTO,
        } as PublishMessagePayload,
        ws,
      );
    },
  })

  .listen(Number(process.env.SOCKET_PORT));

console.log(`🦊 Elysia websocket is running at ${sockets.server?.hostname}:${sockets.server?.port}`);
