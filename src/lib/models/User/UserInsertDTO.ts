export interface UserInsertDTO {
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  refreshToken: string | null;
}
