import { v4 as uuidv4 } from "uuid";

import { ToDoItem } from "./types/ToDo/ToDo";
import { User } from "./types/User/User";

// db
export default class InMemoryDB {
  constructor(
    public todos: ToDoItem[] = [],
    public users: User[] = [],
  ) {}

  initDB = async () => {
    const testUser = {
      id: uuidv4(),
      username: "jenny",
      password: await Bun.password.hash("123456"),

      isOnline: false,
      refreshToken: null,
    };

    const testMessage = {
      id: uuidv4(),
      userId: testUser.id,
      message: "This is an example todo item.",
    };

    this.todos.push(testMessage);
    this.users.push(testUser);
  };
}
