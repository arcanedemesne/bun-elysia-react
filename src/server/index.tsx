/* eslint-disable no-console */
import { cookie } from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { StatusCodes } from "http-status-codes";

import { ResponseError } from "@/lib/types";

import {
  AuthController,
  MainController,
  MessageController,
  OrganizationController,
  TeamController,
  TodoController,
  UserController,
} from "./controllers";
import { deriveUser } from "./deriveUser";

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
  env: "inline",
  target: "bun",
  sourcemap: "external",
});

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger())
  .use(
    cookie({
      secret: process.env.JWT_SECRET,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET as string,
    }),
  )

  // MAIN ROUTE
  .use(MainController)

  // DERIVE (get user during request)
  .use(deriveUser)

  // USERS
  .use(UserController)

  // TODOS
  .use(TodoController)

  // MESSAGES
  .use(MessageController)

  // ORGANIZATIONS
  .use(OrganizationController)

  // TEAMS
  .use(TeamController)

  // AUTH
  .use(AuthController)

  // ERROR
  .onError(({ error, set }) => {
    if (error instanceof ResponseError) {
      set.status = error.status;
      return {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        validation: error.validation,
        name: error.name,
      };
    }

    // Handle other types of errors (e.g., internal server errors)
    set.status = error.status ?? StatusCodes.INTERNAL_SERVER_ERROR;
    console.error("Unhandled error:", error);
    return {
      status: error.status ?? StatusCodes.INTERNAL_SERVER_ERROR,
      statusText: error.code ?? "",
      message: "An error occured with your request",
    };
  })

  // LISTEN
  .listen(Number(process.env.HOST_PORT));

// SERVER INFORMATION
console.log(`🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`);
