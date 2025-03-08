/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import React from 'react';
import { BrowserRouter } from 'react-router';
import { hydrateRoot } from 'react-dom/client';

import App from './App';

const dehydratedState = window.__QUERY_STATE__;
delete window.__QUERY_STATE__;

hydrateRoot(document, 
<BrowserRouter>
  <App dehydratedState={dehydratedState} />
</BrowserRouter>);