import { BaseEntityActive, BaseEntityId, BaseEntityTimeStamps, BaseEntityUserDTO } from "../BaseEntity";
import { User } from "../User";
import { ITodo } from "./ITodo";

export interface TodoDTO extends BaseEntityId, BaseEntityTimeStamps, BaseEntityUserDTO, BaseEntityActive {
  title: string;
  description?: string;
  organizationId?: string;
  teamId?: string;
}

export class Todo {
  constructor(public todo: ITodo) {}

  toDTO = () => {
    return {
      id: this.todo.id,
      title: this.todo.title,
      description: this.todo.description,
      organizationId: this.todo.organizationId,
      teamId: this.todo.teamId,
      createdAt: this.todo.createdAt,
      updatedAt: this.todo.updatedAt,
      deletedAt: this.todo.deletedAt,
      createdBy: this.todo.createdBy ? new User(this.todo.createdBy).toDTO() : null,
      updatedBy: this.todo.updatedBy ? new User(this.todo.updatedBy).toDTO() : null,
      deletedBy: this.todo.deletedBy ? new User(this.todo.deletedBy).toDTO() : null,
    } as TodoDTO;
  };
}
