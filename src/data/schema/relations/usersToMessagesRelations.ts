import { relations } from "drizzle-orm";

import { messages } from "../messages";
import { users } from "../users";
import { usersToMessages } from "../usersToMessages";

export const usersToMessagesRelations = relations(usersToMessages, ({ one }) => ({
  user: one(users, {
    fields: [usersToMessages.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [usersToMessages.messageId],
    references: [messages.id],
  }),
}));
