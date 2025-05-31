import { relations } from "drizzle-orm";
import { index, primaryKey, uuid } from "drizzle-orm/pg-core";

import { schema } from "./config";
import { organizations } from "./organizations";
import { trackableEntity } from "./trackableEntity";
import { users } from "./users";

export const usersToOrganizations = schema.table(
  "users_to_organizations",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),
    ...trackableEntity.UserInfo,
    ...trackableEntity.TimeStamps,
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.organizationId] }),
    index().on(table.organizationId),
    index().on(table.userId),
  ],
);

export const usersToOrganizationsRelations = relations(usersToOrganizations, ({ one }) => ({
  user: one(users, {
    fields: [usersToOrganizations.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [usersToOrganizations.organizationId],
    references: [organizations.id],
  }),
}));
