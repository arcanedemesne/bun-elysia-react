import { UserDTO } from "../User";

export type ToDo = {
  id: string;
  title: string;
  description: string;
  teamId?: string;
  createdBy: UserDTO;
  createdOn: Date;
};
