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

  .listen(Number(process.env.HOST_PORT));

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
