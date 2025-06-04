import { relations } from "drizzle-orm";

import { organizations } from "../organizations";
import { users } from "../users";
import { usersToOrganizations } from "../usersToOrganizations";

export const usersToOrganizationsUserAuditsRelations = relations(usersToOrganizations, ({ one }) => ({
  createdBy: one(users, {
    fields: [usersToOrganizations.createdById],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [usersToOrganizations.updatedById],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [usersToOrganizations.deletedById],
    references: [users.id],
  }),
}));

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
