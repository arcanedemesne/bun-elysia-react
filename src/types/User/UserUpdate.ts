export type UserUpdate = {
  username?: string;
  password?: string;
  isOnline?: boolean,
  refreshToken?: string | null,
}