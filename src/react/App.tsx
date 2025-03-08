import React from "react";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import ToDo from "./components/ToDo";
import Nav from "./components/Nav";

import "./App.css";

const App = ({ dehydratedState }: { dehydratedState: DehydratedState }) => {
  const location = useLocation();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // Prevent refetching on client
        gcTime: Infinity,
      },
    },
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="/public/index.js" type="module" defer />
        <link rel="stylesheet" type="text/css" href="/public/index.css" />
        <link rel="icon" type="image/x-icon" href="/public/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydratedState}>
            <Nav />
            <Outlet />

            <Routes location={location}>
              <Route path="/" element={<ToDo />} />
              <Route path="/login" element={<>Login Page</>} />
            </Routes>
          </HydrationBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
};

export default App;
