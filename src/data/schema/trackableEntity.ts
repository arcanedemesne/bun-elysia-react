import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users";

export const trackableEntity: any = {
  Identifier: {
    id: uuid().defaultRandom().primaryKey(),
  },
  TimeStamps: {
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().$onUpdate(() => new Date()),
    deletedAt: timestamp(),
  },
  UserInfo: {
    createdBy: uuid().references(() => users.id),
    updatedBy: uuid().references(() => users.id),
    deletedBy: uuid().references(() => users.id),
  },
  Active: {
    active: boolean().default(true),
  },
};
