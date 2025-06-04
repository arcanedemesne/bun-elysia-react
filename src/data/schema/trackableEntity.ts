import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const trackableEntity: any = {
  Identifier: {
    id: uuid().defaultRandom().primaryKey(),
  },
  TimeStamps: {
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    deletedAt: timestamp(),
  },
  UserAudits: {
    createdById: uuid(),
    updatedById: uuid(),
    deletedById: uuid(),
  },
  Active: {
    active: boolean().default(true),
  },
};
