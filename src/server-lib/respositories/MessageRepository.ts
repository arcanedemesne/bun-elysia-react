import { and, desc, eq, isNull, lte } from "drizzle-orm";

import { IMessage, IMessageInsert, IMessageUpdate } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { db } from "../../data/db";
import { messages, organizations, teams, usersToMessages, usersToOrganizations, usersToTeams } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { removePropsFromEntities, throwDbError, withRelations } from "./utilities";

const defaultWith = {
  ...withRelations.userAudits,
  organization: {
    where: eq(organizations.active, true),
  },
  team: {
    where: eq(teams.active, true),
  },
  usersToMessages: {
    with: {
      user: true,
    },
  },
};

const transform = <T>(entities: any[]): T => {
  entities = entities.map((x) => ({
    ...x,
    recipients: x.usersToMessages?.map((t: any) => ({ ...t.user, isRead: t.isRead })),
  }));

  entities = removePropsFromEntities(
    entities.filter((x) => x.usersToMessages?.length > 0),
    ["usersToMessages"],
  );

  return entities as T;
};

const defaultPagingOptions = { orderBy: [desc(messages.createdAt)], limit: 5, offset: 0 };

const roundMilliseconds = (date?: Date): Date => {
  const convertedDate = date ? new Date(date) : new Date();
  convertedDate.setMilliseconds(convertedDate.getMilliseconds() + 500);
  return convertedDate;
};

export class MessageRepository extends BaseRepository<IMessage, IMessageInsert, IMessageUpdate> {
  constructor(public userId: string) {
    super(messages, "Message", userId, defaultWith, transform);
  }

  override async insert(payload: IMessageInsert): Promise<IMessage | null> {
    try {
      let messageId = "";
      await db.transaction(async (tx) => {
        const insertPayload = { ...payload, createdById: this.userId };
        const entities = await tx.insert(messages).values(insertPayload).returning();

        if (entities.length === 0) {
          throw new Error(`Could not insert ${this.entityTypeName}`);
        }

        const { id } = entities[0];
        messageId = id;

        let memberIds: { id: any }[] = [];

        if (payload.organizationId) {
          memberIds = await db
            .select({ id: usersToOrganizations.userId })
            .from(usersToOrganizations)
            .where(eq(usersToOrganizations.organizationId, payload.organizationId));
        } else if (payload.teamId) {
          memberIds = await db
            .select({ id: usersToTeams.userId })
            .from(usersToTeams)
            .where(eq(usersToTeams.teamId, payload.teamId));
        }

        for (const userId of memberIds.map((x) => x.id)) {
          const memberMessage = await tx
            .insert(usersToMessages)
            .values({ messageId, userId, isRead: userId === this.userId })
            .returning();
          if (memberMessage.length === 0) {
            throw new Error(`Could not insert User ${this.entityTypeName}`);
          }
        }
      });

      let entity = await db.query.messages.findFirst({
        with: this.defaultWith,
        where: and(this.clauses.hasId(messageId), this.clauses.active),
      });

      if (!entity) {
        throw new Error(`Could not insert ${this.entityTypeName}`);
      }

      return entity ? (transform<IMessage[]>([entity])[0] as IMessage) : null;
    } catch (error) {
      return throwDbError(`Error inserting ${this.entityTypeName}`, error);
    }
  }

  async getByChannel(channel: string, entityId: string, before?: Date): Promise<IMessage[]> {
    let response: IMessage[] = [];

    const buildQuery = (whereChannel: any, whereEntity1: any, whereEntity2?: any) =>
      db.query.messages.findMany({
        with: {
          ...defaultWith,
          usersToMessages: {
            where: eq(usersToMessages.userId, this.userId),
            with: {
              user: true,
            },
          },
        },
        where: and(
          whereChannel,
          whereEntity1,
          whereEntity2,
          lte(messages.createdAt, roundMilliseconds(before)),
          this.clauses.active,
        ),
        ...defaultPagingOptions,
      });

    switch (channel) {
      case ChannelTypes.ORGANIZATION_CHAT:
        response = (
          await buildQuery(
            eq(messages.channel, ChannelTypes.ORGANIZATION_CHAT),
            eq(messages.organizationId, entityId),
            isNull(messages.teamId),
          ).execute()
        ).toReversed() as IMessage[];
        break;
      case ChannelTypes.TEAM_CHAT:
        response = (
          await buildQuery(eq(messages.channel, ChannelTypes.TEAM_CHAT), eq(messages.teamId, entityId)).execute()
        ).toReversed() as IMessage[];
        break;
      case ChannelTypes.PRIVATE_CHAT:
        response = (
          await buildQuery(
            eq(messages.channel, ChannelTypes.PRIVATE_CHAT),
            isNull(messages.organizationId),
            isNull(messages.teamId),
          ).execute()
        ).toReversed() as IMessage[];
        break;
      case ChannelTypes.PUBLIC_CHAT:
      default:
        throw new Error(`Invalid channel ${channel}.`);
    }

    return transform(response);
  }

  async markAllAsRead(channel: string, entityId: string, before?: Date): Promise<boolean> {
    try {
      const buildQuery = (whereEntityId: any) =>
        db
          .update(usersToMessages)
          .set({ isRead: true })
          .from(messages)
          .where(
            and(
              eq(messages.id, usersToMessages.messageId),
              whereEntityId,
              eq(usersToMessages.userId, this.userId),
              lte(messages.createdAt, roundMilliseconds(before)),
            ),
          );
      let success = false;
      switch (channel) {
        case ChannelTypes.ORGANIZATION_CHAT:
          success = (await buildQuery(eq(messages.organizationId, entityId)).returning()).length > 0;
          break;
        case ChannelTypes.TEAM_CHAT:
          success = (await buildQuery(eq(messages.teamId, entityId)).returning()).length > 0;
          break;
        case ChannelTypes.PRIVATE_CHAT:
          break;
        case ChannelTypes.PUBLIC_CHAT:
        default:
          throw new Error(`Invalid channel ${channel}.`);
      }
      return success;
    } catch (error) {
      return throwDbError("Error marking all as read", error);
    }
  }
}
