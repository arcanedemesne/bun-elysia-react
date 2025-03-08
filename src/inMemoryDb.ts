import { v4 as uuidv4 } from "uuid";

import { ToDoItem } from "./types/ToDo";

// db
export default class ToDoDB {
  constructor(
    public data: ToDoItem[] = [{ id: uuidv4(), message: "This is a todo item" }]
  ) {}
}