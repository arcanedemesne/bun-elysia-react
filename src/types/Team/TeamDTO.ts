import { UserDTO } from "../User/UserDTO";

export type TeamDTO = {
  id: string;
  name: string;
  createdBy: UserDTO;
  members: UserDTO[];
}