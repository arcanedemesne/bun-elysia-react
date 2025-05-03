import { UserDTO } from "@/lib/models";

export type TodoDTO = {
  id: string;
  title: string;
  description: string;
  teamId?: string;
  createdBy: UserDTO;
  createdOn: Date;
};
