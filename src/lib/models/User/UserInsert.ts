export type UserInsert = {
  username: string;
  password: string;
  isOnline: boolean;
  refreshToken: string | null;
};
