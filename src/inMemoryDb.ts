import { v4 as uuidv4 } from "uuid";

import { ToDoItem } from "./types/ToDo";
import { User } from "./types/User";

// db
export default class InMemoryDB {
  constructor(
    public todos: ToDoItem[] = [],
    public users: User[] = [],
  ) {}

  initDB = async () => {
    this.todos.push({ id: uuidv4(), message: "This is a todo item" });
    this.users.push({
      id: uuidv4(),
      username: "jenny",
      password: await Bun.password.hash("123456"),

      isOnline: false,
      refreshToken: null,
    });
  };
}
