/**
 * Hook para manejar el usuario autenticado
 * Solve: localStorage parse sin validación (riesgo de crash)
 * Single Responsibility: solo maneja auth user
 */

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "../types/auth.type";

const AUTH_USER_KEY = "authUser";
const TOKEN_KEY = "token";

interface UseAuthUserReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
}

/**
 * Hook para obtener y validar el usuario del localStorage
 */
export function useAuthUser(): UseAuthUserReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseUser = useCallback((): AuthUser | null => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!parsed.email || !parsed.token) return null;
      return parsed as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedUser = parseUser();
    setUser(storedUser);
    setIsLoading(false);
  }, [parseUser]);

  const isAuthenticated = !!user && !!user.token;

  const updateUser = useCallback((newUser: AuthUser) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_KEY, newUser.token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    updateUser,
    logout,
    getToken,
  };
}

/**
 * Hook para obtener solo el token (más simple)
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  return token;
}
