import React from "react";
import { Elysia, error } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { renderToReadableStream } from "react-dom/server";
import { v4 as uuidv4 } from "uuid";

import App from "./react/App";
import { ToDoItem } from "./types/ToDo";
import { StaticRouter } from "react-router";
import { dehydrate, QueryClient } from "@tanstack/react-query";

await Bun.build({
  entrypoints: ["./src/react/index.tsx"],
  outdir: "./public",
});

// db
class ToDo {
  constructor(
    public data: ToDoItem[] = [{ id: uuidv4(), message: "This is a todo item" }]
  ) {}
}

class ScriptInjectionStream extends TransformStream {
  scriptInjected = false;
  dehydratedString = null;

  constructor(dehydratedString: any) {
    super({
      transform: (chunk, controller) => this.transformChunk(chunk, controller),
      flush: (controller) => this.flushStream(controller),
    });
    this.scriptInjected = false;
    this.dehydratedString = dehydratedString;
  }

  transformChunk(chunk: any, controller: any) {
    controller.enqueue(chunk);
    if (!this.scriptInjected) {
      const script = `<script>window.__QUERY_STATE__ = ${this.dehydratedString}</script>`;
      controller.enqueue(new TextEncoder().encode(script));
      this.scriptInjected = true;
    }
  }

  flushStream(controller: any) {
    if (!this.scriptInjected) {
      const script = `<script>window.__QUERY_STATE__ = ${this.dehydratedString}</script>`;
      controller.enqueue(new TextEncoder().encode(script));
    }
  }
}

async function fetchData(queryClient: any, url: string) {
  if (url === "/") {
    await queryClient.prefetchQuery({
      queryKey: ["todoData"],
      queryFn: async () => {
        const todos = await app.handle(new Request(`${apiHost}/api/todos`));
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
          gcTime: Infinity, // Corrected: Use gcTime instead
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
        //bootstrapScripts: ["/public/index.js"],
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
  .decorate("todoDB", new ToDo())
  .get("/api/todos", ({ todoDB }) => todoDB.data)
  .get("/api/todos/:id", ({ todoDB, params: { id } }) => {
    const todo = todoDB.data.find((todo) => todo.id === id);
    if (!todo) {
      error(404);
    }
    return todo;
  })
  .post("/api/todos", ({ todoDB, body }) => {
    const parsed = JSON.parse(body as string);
    todoDB.data.push(parsed as ToDoItem);
  })
  .delete("/api/todos/:id", ({ todoDB, params: { id } }) => {
    const index = todoDB.data.findIndex((todo: ToDoItem) => todo.id === id);
    todoDB.data.splice(index, 1);
  })
  .listen(3000);

  const apiHost = `${app.server?.hostname}:${app.server?.port}`;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
