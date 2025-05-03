export type User = {
  id: string;
  username: string;
  password: string;
  isOnline: boolean;
  refreshToken: string | null;
};
