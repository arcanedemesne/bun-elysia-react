import { Key } from "react";

export type User = {
  id: Key;
  username: string;
  password: string;

  isOnline: boolean,
  refreshToken: string | null,
}