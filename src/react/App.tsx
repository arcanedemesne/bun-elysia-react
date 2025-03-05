import React from "react";
import ToDo from "./components/ToDo";

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
        <nav>
          <div className="logo">
              ToDos
          </div>
          <div className="nav-right">
              <a href="#">Login</a>
          </div>
        </nav>

        <ToDo />
      </body>
    </html>
  );
};

export default App;