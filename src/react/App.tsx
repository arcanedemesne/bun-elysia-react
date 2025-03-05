import React from "react";
import ToDo from "./components/ToDo";
import Nav from "./components/Nav";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

import "./App.css";

function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" type="text/css" href="/public/index.css" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Nav />

          <ToDo />
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default App;