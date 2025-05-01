import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

import { deriveUser } from "./deriveUser";
import {
  mainRoutes,
  authRoutes,
  todoRoutes,
  userRoutes,
  teamRoutes,
  teamMemberRoutes,
} from "./routes";
import { ResponseError } from "./types";
import { StatusCodes } from "http-status-codes";

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

  // TODOS
  .use(todoRoutes)

  // USERS
  .use(userRoutes)

  // TEAMS
  .use(teamRoutes)

  // TEAM MEMBERS
  .use(teamMemberRoutes)

  // AUTH
  .use(authRoutes)

  .onError(({ code, error, set }) => {
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

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
