export type UserRole = "ADMIN" | "RECRUITER";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  role: UserRole;
  token: string;
  roles: string[];
  id?: number;
  name?: string;
}
