/* eslint-disable no-console */
import { eq } from "drizzle-orm";

import { ChannelTypes } from "../lib";
import { db } from "./db";
import { messages, organizations, teams, todos, users, usersToOrganizations, usersToTeams } from "./schema";

interface SeedUser {
  username: string;
  email: string;
  password: string;
  createdById?: string;
}

const createUser = ({ username, email, password, createdById }: SeedUser) => {
  return {
    username,
    email,
    password,
    createdById,
  };
};

interface SeedOrganization {
  name: string;
  description: string;
  createdById: string;
}

const createOrganization = ({ name, description, createdById }: SeedOrganization) => {
  return {
    name,
    description,
    createdById,
  };
};

interface SeedTeam {
  name: string;
  organizationId: string;
  createdById: string;
}

const createTeam = ({ name, organizationId, createdById }: SeedTeam) => {
  return {
    name,
    organizationId,
    createdById,
  };
};

const seedDatabase = async () => {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(teams);
      await tx.delete(usersToTeams);
      await tx.delete(todos);
      await tx.delete(organizations);
      await tx.delete(usersToOrganizations);
      await tx.delete(users);
      console.log(`Tables cleared of data`);

      const seedUsers: SeedUser[] = [];
      seedUsers.push(
        createUser({
          username: "jenny",
          email: "jenny@example.com",
          password: await Bun.password.hash("123456"),
        }),
        createUser({
          username: "jenny1",
          email: "jenny1@example.com",
          password: await Bun.password.hash("123456"),
        }),
      );

      let lastUserId: string | undefined = undefined;
      for (const seedUser of seedUsers) {
        // 1. Insert or Update the user
        const existingUser = await tx
          .select({ username: users.username, email: users.email })
          .from(users)
          .where(eq(users.username, seedUser.username));

        let userId: string;

        if (existingUser.length > 0) {
          // Update existing user
          const updatedUser = await tx
            .update(users)
            .set({ email: seedUser.email, password: seedUser.password })
            .where(eq(users.username, seedUser.username))
            .returning({ id: users.id });
          userId = updatedUser[0].id;
          console.log(`User ${seedUser.username} updated`);
        } else {
          // Insert a seed user
          const insertedUsers = await tx
            .insert(users)
            .values({
              username: seedUser.username,
              password: seedUser.password,
              email: seedUser.email,
            })
            .returning({
              id: users.id,
            });

          if (insertedUsers.length === 0) {
            throw new Error("Failed to insert user");
          }
          userId = insertedUsers[0].id;
          tx.update(users).set({ createdById: userId }).where(eq(users.id, userId)).returning();
          console.log(`User ${seedUser.username} created with ID: ${userId}`);
        }

        // 2. Insert a private message for the seed user
        if (lastUserId) {
          const insertedPrivateMessage = await tx
            .insert(messages)
            .values({
              channel: ChannelTypes.PRIVATE_CHAT,
              message: "This is a private chat!",
              recipientId: lastUserId,
              createdById: userId,
            })
            .returning();
          console.log("Private message inserted", insertedPrivateMessage);
        }
        lastUserId = userId;

        // 3. Insert a todo for the seed user
        const insertedTodo = await tx
          .insert(todos)
          .values({
            title: "This is an example todo item",
            description: "This is an example description",
            createdById: userId,
          })
          .returning();
        console.log("User todo inserted", insertedTodo);

        const seedOrganization: SeedOrganization = createOrganization({
          name: "JennyBot Inc.",
          description: "Example Organization #1",
          createdById: userId,
        });

        // 4. Insert or Update the Organization
        const existingOrganization = await tx
          .select({ name: organizations.name })
          .from(organizations)
          .where(eq(organizations.name, seedOrganization.name));

        let organizationId: string;

        if (existingOrganization.length > 0) {
          // Update existing organiztion
          const updatedOrganization = await tx
            .update(organizations)
            .set({
              name: seedOrganization.name,
              description: seedOrganization.description,
              updatedById: userId,
              updatedAt: new Date(),
            })
            .where(eq(organizations.name, seedOrganization.name))
            .returning({ id: organizations.id });
          organizationId = updatedOrganization[0].id;
          console.log(`User ${seedUser.username} updated`);
        } else {
          // Insert a seed organization
          const insertedOrganizations = await tx
            .insert(organizations)
            .values({
              name: seedOrganization.name,
              description: seedOrganization.description,
              createdById: seedOrganization.createdById,
            })
            .returning({
              id: organizations.id,
            });

          if (insertedOrganizations.length === 0) {
            throw new Error("Failed to insert organization");
          }
          organizationId = insertedOrganizations[0].id;
          console.log(`Organization ${seedOrganization.name} created with ID: ${organizationId}`);
        }

        // 5. Insert a connection between seed user and seed organization
        const insertedUserOrganization = await tx
          .insert(usersToOrganizations)
          .values({ userId, organizationId, createdById: userId })
          .returning();
        console.log("User-Organization connection inserted", insertedUserOrganization);

        // 6. Insert a message for the seed organization
        const insertedOrganizationMessage = await tx
          .insert(messages)
          .values({
            channel: ChannelTypes.ORGANIZATION_CHAT,
            message: "We're at the same organization!",
            organizationId,
            createdById: userId,
          })
          .returning();
        console.log("Organization message inserted", insertedOrganizationMessage);

        const seedTeams: SeedTeam[] = [];
        seedTeams.push(
          createTeam({
            name: "Seed Team #1",
            organizationId,
            createdById: userId,
          }),
          createTeam({
            name: "Seed Team #2",
            organizationId,
            createdById: userId,
          }),
        );

        for (const seedTeam of seedTeams) {
          // 7. Insert or Update a seed team
          const existingTeam = await tx.select({ id: teams.id }).from(teams).where(eq(teams.name, seedTeam.name));
          let teamId: string;
          if (existingTeam.length > 0) {
            // Update existing team
            const updatedTeam = await tx
              .update(teams)
              .set({ updatedById: userId })
              .where(eq(teams.name, seedTeam.name))
              .returning({ id: teams.id });
            teamId = updatedTeam[0].id;
            console.log(`Team ${seedTeam.name} updated`);
          } else {
            const insertedTeams = await tx
              .insert(teams)
              .values({
                name: seedTeam.name,
                organizationId,
                createdById: userId,
              })
              .returning({
                id: teams.id,
              });
            if (insertedTeams.length === 0) {
              throw new Error("Failed to insert team");
            }
            teamId = insertedTeams[0].id;
            console.log(`Team "${seedTeam.name}" inserted with ID: ${teamId}`);
          }

          // 8. Insert a connection between seed user and seed team
          const insertedUserTeam = await tx
            .insert(usersToTeams)
            .values({ userId: userId, teamId: teamId, createdById: userId })
            .returning();
          console.log("User-Team connection inserted", insertedUserTeam);

          // 9. Insert a todo for the seed team
          const insertedTeamTodo = await tx
            .insert(todos)
            .values({
              title: "This is a team example todo item",
              description: "This is a team example description",
              organizationId,
              teamId,
              createdById: userId,
            })
            .returning();
          console.log("Team todo inserted", insertedTeamTodo);

          // 10. Insert a message for the seed team
          const insertedTeamMessage = await tx
            .insert(messages)
            .values({
              channel: ChannelTypes.TEAM_CHAT,
              message: "We're on the same team!",
              organizationId,
              teamId,
              createdById: userId,
            })
            .returning();
          console.log("Team message inserted", insertedTeamMessage);
        }
      }
    });

    console.log("Seed data inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error; // Re-throw the error to be caught by the caller, if necessary
  } finally {
    process.exit();
  }
};

// Run the seed function
seedDatabase().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});
