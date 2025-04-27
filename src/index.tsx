import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import jwt from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";

import { deriveUser } from "./deriveUser";
import { mainRoutes } from "./routes/main.routes";
import { authRoutes } from "./routes/auth.routes";
import { todoRoutes } from "./routes/todo.routes";
import { userRoutes } from "./routes/user.routes";
import { teamRoutes } from "./routes/team.routes";
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

  // AUTH
  .use(authRoutes)

  .onError(({ code, error, set }) => {
    console.log("inside onError in server");

    if (error instanceof ResponseError) {
      set.status = error.status;
      return error;
    }

    // Handle other types of errors (e.g., internal server errors)
    set.status = StatusCodes.INTERNAL_SERVER_ERROR;
    console.error("Unhandled error:", error);
    return {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    };
  })

  .listen(Number(process.env.HOST_PORT));

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
