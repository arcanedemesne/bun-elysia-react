import { UserDTO } from "../User/UserDTO";

export type TeamDTO = {
  id: string;
  name: string;
  createdBy: UserDTO;
  createdOn: Date;
  members: UserDTO[];
  todos: number;
};
