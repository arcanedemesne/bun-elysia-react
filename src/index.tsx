import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";

import { ResponseError } from "@/lib/types";

import { deriveUser } from "./deriveUser";
import {
  authRoutes,
  mainRoutes,
  teamMemberRoutes,
  teamRoutes,
  todoRoutes,
  userRoutes,
} from "./routes";
import { cookie } from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
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
  .use(mainRoutes)

  // DERIVE (get user during request)
  .use(deriveUser)

  // USERS
  .use(userRoutes)

  // TODOS
  .use(todoRoutes)

  // TEAMS
  .use(teamRoutes)

  // TEAM MEMBERS
  .use(teamMemberRoutes)

  // AUTH
  .use(authRoutes)

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

  .listen(Number(process.env.HOST_PORT));

// eslint-disable-next-line no-console
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
