import { boolean, index, primaryKey, uuid } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { messages } from "./messages";
import { users } from "./users";

export const usersToMessages = schema.table(
  "users_to_messages",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    messageId: uuid()
      .notNull()
      .references(() => messages.id, {
        onDelete: "cascade",
      }),
    isRead: boolean().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.messageId] }),
    index().on(table.userId),
    index().on(table.messageId),
  ],
);
