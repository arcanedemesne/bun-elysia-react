export interface UserInsertDTO {
  username: string;
  email: string;
  password: string;
  isOnline: boolean;
  sessionId: string | null;
  refreshToken: string | null;
}
