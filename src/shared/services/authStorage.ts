import type { AuthUser } from "../types/auth.type";

export const getAuthUser = (): AuthUser | null => {
  const value = localStorage.getItem("authUser");

  if (!value) return null;

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const saveAuthUser = (user: AuthUser): void => {
  localStorage.setItem("authUser", JSON.stringify(user));
  localStorage.setItem("token", user.token);
};

export const clearAuthUser = (): void => {
  localStorage.removeItem("authUser");
  localStorage.removeItem("token");
};
