import { and, eq, isNull } from "drizzle-orm";

import { IMessage, IMessageInsert, IMessageUpdate } from "@/lib/models";
import { ChannelTypes } from "@/lib/types";

import { db } from "../../data/db";
import { messages, organizations, teams, users } from "../../data/schema";
import { BaseRepository } from "./BaseRepository";
import { throwDbError, withRelations } from "./utilities";

const defaultWith = {
  ...withRelations.userAudits,
  organization: {
    where: eq(organizations.active, true),
  },
  team: {
    where: eq(teams.active, true),
  },
  recipient: {
    where: eq(users.active, true),
  },
};

export class MessageRepository extends BaseRepository<IMessage, IMessageInsert, IMessageUpdate> {
  constructor(public userId: string) {
    super(messages, "Message", userId, defaultWith);
  }

  //TODO: This could use more work
  async getByUserId(userId: string, asRecipient: boolean = true): Promise<IMessage[]> {
    try {
      return (await db.query.messages.findMany({
        with: defaultWith,
        where: and(
          eq(messages.channel, ChannelTypes.PRIVATE_CHAT),
          eq(asRecipient ? messages.recipientId : messages.createdById, userId),
          isNull(messages.organizationId),
          isNull(messages.teamId),
          this.clauses.active,
        ),
      })) as IMessage[];
    } catch (error) {
      return throwDbError("Error getting messages for user", error);
    }
  }

  async getByOrganizationId(organizationId: string): Promise<IMessage[]> {
    try {
      return (await db.query.messages.findMany({
        with: defaultWith,
        where: and(
          eq(messages.channel, ChannelTypes.ORGANIZATION_CHAT),
          eq(messages.organizationId, organizationId),
          this.clauses.active,
        ),
      })) as IMessage[];
    } catch (error) {
      return throwDbError("Error getting messages for organization", error);
    }
  }

  async getByTeamId(teamId: string): Promise<IMessage[]> {
    try {
      return (await db.query.messages.findMany({
        with: defaultWith,
        where: and(eq(messages.channel, ChannelTypes.TEAM_CHAT), eq(messages.teamId, teamId), this.clauses.active),
      })) as IMessage[];
    } catch (error) {
      return throwDbError("Error getting messages for team", error);
    }
  }
}
