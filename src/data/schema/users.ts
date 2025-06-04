import { boolean, index, text, uuid, varchar } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { trackableEntity } from "./trackableEntity";

export const users = schema.table(
  "users",
  {
    ...trackableEntity.Identifier,
    username: varchar({ length: 25 }).unique().notNull(),
    email: varchar({ length: 255 }).unique().notNull(),
    password: varchar({ length: 255 }).notNull(),
    isOnline: boolean().notNull().default(false),
    sessionId: uuid(),
    refreshToken: text(),
    ...trackableEntity.UserAudits,
    ...trackableEntity.TimeStamps,
    ...trackableEntity.Active,
  },
  (table) => [
    index().on(table.username),
    index().on(table.email),
    index().on(table.createdAt),
    index().on(table.createdById),
    index().on(table.active),
  ],
);
