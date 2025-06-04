import { BaseEntity, BaseEntityDTO, IBaseEntityDTO } from "../BaseEntity";
import { ITodo } from "./ITodo";

export interface ITodoDTO extends IBaseEntityDTO {
  title: string;
  description?: string;
  organizationId?: string;
  teamId?: string;
}

export class TodoDTO extends BaseEntityDTO implements ITodoDTO {
  title: string;
  description?: string;
  organizationId?: string;
  teamId?: string;

  constructor(todo: ITodo) {
    super(todo);

    this.title = todo.title;
    this.description = todo.description;
    this.organizationId = todo.organizationId;
    this.teamId = todo.teamId;
  }
}

export class Todo extends BaseEntity implements ITodo {
  title: string;
  description?: string;
  organizationId?: string;
  teamId?: string;

  constructor(public todo: ITodo) {
    super(todo);

    this.title = todo.title;
    this.description = todo.description;
    this.organizationId = todo.organizationId;
    this.teamId = todo.teamId;
  }

  toDTO = () => new TodoDTO(this);
}
