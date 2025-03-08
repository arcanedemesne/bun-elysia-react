import React from "react";
import { StaticRouter } from "react-router";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { renderToReadableStream } from "react-dom/server";

import App from "./react/App";
import { ToDoItem } from "./types/ToDo";
import ToDoDB from "./inMemoryDb";
import ScriptInjectionStream from "./scriptInjectionStream";

const hostPort = 3000;
const apiPrefix = "api";
const todoRoute = "todos";

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
});

async function fetchData(queryClient: QueryClient, url: string) {
  if (url === "/") {
    await queryClient.prefetchQuery({
      queryKey: ["todoData"],
      queryFn: async () => {
        const todos = await app.handle(
          new Request(`${apiHost}/${apiPrefix}/${todoRoute}`)
        );
        const data = await todos.json();
        return data;
      },
    });
  }
  // Add other routes here if needed
}

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger())
  .get("*", async ({ request }) => {
    const url = new URL(request.url).pathname;

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          staleTime: Infinity,
        },
      },
    });

    await fetchData(queryClient, url);

    const dehydratedState = dehydrate(queryClient);
    const dehydratedString = JSON.stringify(dehydratedState);

    // render the app component to a readable stream
    const stream = await renderToReadableStream(
      <StaticRouter location={url}>
        <App dehydratedState={dehydratedState} />
      </StaticRouter>,
      {
        onError(error) {
          console.error(error);
        },
      }
    );

    const modifiedStream = stream.pipeThrough(
      new ScriptInjectionStream(dehydratedString)
    );

    const response = new Response(modifiedStream, {
      headers: { "Content-Type": "text/html" },
    });

    return response;
  })
  .decorate("todoDB", new ToDoDB())
  .get(`/${apiPrefix}/${todoRoute}`, ({ todoDB }) => todoDB.data)
  .get(`/${apiPrefix}/${todoRoute}/:id`, ({ todoDB, params: { id } }) => {
    const todo = todoDB.data.find((todo) => todo.id === id);
    if (!todo) {
      error(404);
    }
    return todo;
  })
  .post(`/${apiPrefix}/${todoRoute}`, ({ todoDB, body }) => {
    const parsed = JSON.parse(body as string);
    todoDB.data.push(parsed as ToDoItem);
  })
  .delete(`/${apiPrefix}/${todoRoute}/:id`, ({ todoDB, params: { id } }) => {
    const index = todoDB.data.findIndex((todo: ToDoItem) => todo.id === id);
    todoDB.data.splice(index, 1);
  })
  .listen(hostPort);

const apiHost = `${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
