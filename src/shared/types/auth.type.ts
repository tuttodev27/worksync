export type UserRole = "ADMIN" | "RECRUITER";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}