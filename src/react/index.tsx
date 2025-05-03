/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";

const dehydratedState = window.__QUERY_STATE__;
delete window.__QUERY_STATE__;

const userDTO = window.__USER_DATA__;
delete window.__USER_DATA__;

hydrateRoot(
  document,
  <BrowserRouter>
    <App dehydratedState={dehydratedState} user={userDTO} />
  </BrowserRouter>,
);
