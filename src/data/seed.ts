/* eslint-disable no-console */
import { eq } from "drizzle-orm";

import { ChannelTypes } from "../lib";
import { db } from "./db";
import { messages, organizations, teams, todos, users, usersToOrganizations, usersToTeams } from "./schema";
import { usersToMessages } from "./schema/usersToMessages";

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
  createdById?: string;
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
      await tx.delete(messages);
      await tx.delete(usersToMessages);
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

      let firstUserId: string | undefined = undefined;
      let secondUserId: string | undefined = undefined;
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

          if (firstUserId) {
            secondUserId = userId;
          } else {
            firstUserId = userId;
          }

          console.log(`User ${seedUser.username} created with ID: ${userId}`);
        }
      }

      // 2. Insert a private message for the seed user
      if (firstUserId && secondUserId) {
        const insertedPrivateMessage = await tx
          .insert(messages)
          .values({
            channel: ChannelTypes.PRIVATE_CHAT,
            message: "This is a private chat!",
            createdById: firstUserId,
          })
          .returning();
        await tx
          .insert(usersToMessages)
          .values({ userId: firstUserId, messageId: insertedPrivateMessage[0].id })
          .returning();
        await tx
          .insert(usersToMessages)
          .values({ userId: secondUserId, messageId: insertedPrivateMessage[0].id })
          .returning();
        console.log("Private message inserted", insertedPrivateMessage);

        // 3. Insert a todo for the seed users
        const insertedTodo1 = await tx
          .insert(todos)
          .values({
            title: "This is an example personal todo item",
            description: "This is an example description",
            createdById: firstUserId,
          })
          .returning();
        console.log("User todo inserted", insertedTodo1);

        const insertedTodo2 = await tx
          .insert(todos)
          .values({
            title: "This is an example personal todo item",
            description: "This is an example description",
            createdById: secondUserId,
          })
          .returning();
        console.log("User todo inserted", insertedTodo2);

        const seedOrganization: SeedOrganization = createOrganization({
          name: "JennyBot Inc.",
          description: "Example Organization #1",
          createdById: firstUserId,
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
              updatedById: firstUserId,
              updatedAt: new Date(),
            })
            .where(eq(organizations.name, seedOrganization.name))
            .returning({ id: organizations.id });
          organizationId = updatedOrganization[0].id;
          console.log(`Organization ${seedOrganization.name} updated`);
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

        // 5. Insert a connection between seed users and seed organization
        const insertedUserOrganization1 = await tx
          .insert(usersToOrganizations)
          .values({ userId: firstUserId, organizationId, createdById: firstUserId })
          .returning();
        console.log("User-Organization connection inserted", insertedUserOrganization1);

        const insertedUserOrganization2 = await tx
          .insert(usersToOrganizations)
          .values({ userId: secondUserId, organizationId, createdById: secondUserId })
          .returning();
        console.log("User-Organization connection inserted", insertedUserOrganization2);

        // 6. Insert a message for the seed organization
        const insertedOrganizationMessage = await tx
          .insert(messages)
          .values({
            channel: ChannelTypes.ORGANIZATION_CHAT,
            message: "We're at the same organization!",
            organizationId,
            createdById: firstUserId,
          })
          .returning();
        await tx
          .insert(usersToMessages)
          .values({ userId: firstUserId, messageId: insertedOrganizationMessage[0].id })
          .returning();
        await tx
          .insert(usersToMessages)
          .values({ userId: secondUserId, messageId: insertedOrganizationMessage[0].id })
          .returning();
        console.log("Organization message inserted", insertedOrganizationMessage);

        const seedTeams: SeedTeam[] = [];
        seedTeams.push(
          createTeam({
            name: "Seed Team #1",
            organizationId,
            createdById: firstUserId,
          }),
          createTeam({
            name: "Seed Team #2",
            organizationId,
            createdById: secondUserId,
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
              .set({ updatedById: firstUserId })
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
                createdById: firstUserId,
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

          // 8. Insert connections between seed users and seed teams
          const insertedUserTeam1 = await tx
            .insert(usersToTeams)
            .values({ userId: firstUserId, teamId: teamId, createdById: firstUserId })
            .returning();
          console.log("User-Team connection inserted", insertedUserTeam1);

          const insertedUserTeam2 = await tx
            .insert(usersToTeams)
            .values({ userId: secondUserId, teamId: teamId, createdById: secondUserId })
            .returning();
          console.log("User-Team connection inserted", insertedUserTeam2);

          // 9. Insert a todo for the seed team
          const insertedTeamTodo = await tx
            .insert(todos)
            .values({
              title: "This is a team example team todo item",
              description: "This is a team example description",
              organizationId,
              teamId,
              createdById: firstUserId,
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
              createdById: firstUserId,
            })
            .returning();
          await tx
            .insert(usersToMessages)
            .values({ userId: firstUserId, messageId: insertedTeamMessage[0].id })
            .returning();
          await tx
            .insert(usersToMessages)
            .values({ userId: secondUserId, messageId: insertedTeamMessage[0].id })
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
