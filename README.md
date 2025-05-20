# Elysia with Bun runtime

## Development
To run everything containerized:
```bash
docker-compose down -v #this will remove images and volumes
docker-compose up --build #this will build and run the app
```

To start the development server run:
```bash
bun db-publish #this will create your drizzle schema and migrate to postgresql
bun db-seed #this will give you some initial data to play with
bun run dev #be sure to stop the process in docker destop first
```

Open http://localhost:3000/ with your browser to see the result.
Note: Sockets run on port :8080 


```bash
Note: create a .env file with these contents if you want to run the app using bun

NODE_ENV = development
HOST = localhost
HOST_PORT = 3000
SOCKET_PORT = 8080
JWT_SECRET = "secret-key-for-todo-app"
POSTGRES_HOST = localhost
POSTGRES_PORT = 5432
POSTGRES_USER = todo_user
POSTGRES_PASSWORD = todo_password
POSTGRES_DB = todo_database
POSTGRES_URL = "postgres://todo_user:todo_password@localhost:5432/todo_database"
```