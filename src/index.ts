import { Elysia, error } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { staticPlugin } from '@elysiajs/static';
import { renderToReadableStream } from 'react-dom/server';
import { createElement } from "react";
import { v4 as uuidv4 } from 'uuid';

import App from './react/App';
import { ToDoItem } from "./types/ToDo";

await Bun.build({
  entrypoints: ['./src/react/index.tsx'],
  outdir: './public',
});

// db
class ToDo { 
  constructor(public data: ToDoItem[] = [
    {id: uuidv4(), message: "This is a todo item"}
  ]) {} 
}

const app = new Elysia()
  .use(staticPlugin())
  .use(swagger()) 
  .get('/', async () => {

    // create our react App component
    const app = createElement(App);

    // render the app component to a readable stream
    const stream = await renderToReadableStream(app, {
      bootstrapScripts: ['/public/index.js']
    });

    // output the stream as the response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/html' }
    });
  })
  .decorate('todoDB', new ToDo())
  .get('/api/todos', ({ todoDB }) => todoDB.data)
  .get('/api/todos/:id', ({ todoDB, params: { id } }) => {
    const todo = todoDB.data.find(todo => todo.id === id);
    if (!todo) {
      error(404);
    }
    return todo;
  })
  .post('/api/todos', ({ todoDB, body }) => {
    const parsed = JSON.parse(body as string);
    todoDB.data.push(parsed as ToDoItem);
  })
  .delete('/api/todos/:id', ({ todoDB, params: { id } }) => {
    const index  = todoDB.data.findIndex((todo: ToDoItem) => todo.id === id);
    todoDB.data.splice(index, 1);
  })
  .listen(3000);

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
  