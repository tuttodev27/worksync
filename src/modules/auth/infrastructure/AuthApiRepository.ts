/**
 * Implementación del repositorio de autenticación contra el backend
 * Infrastructure Layer - Capa de datos
 * Esta es la única parte que sabe cómo hacer las llamadas HTTP
 */

import type { AuthRepository, AuthResult } from "../domain/ports/AuthRepository";
import type { LoginFormData } from "../../../shared/types/forms";
import type { AuthUser, UserRole } from "../../../shared/types/auth.type";
import { API_USERS_URL } from "../../../shared/constants/forms";
import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { decodeJwt } from "../../../shared/utils/jwt";

interface LoginApiResponse {
  token: string;
  tokenType: string;
  expiredInSeconds: number;
}

function mapRolesToUserRole(roles: string[]): UserRole {
  const hasAdmin = roles.some((r) => r.toUpperCase().includes("ADMIN"));
  return hasAdmin ? "ADMIN" : "RECRUITER";
}

function buildAuthUser(token: string, fallbackEmail: string): AuthUser {
  const payload = decodeJwt(token);
  const email =
    (typeof payload?.email === "string" && payload.email) ||
    (typeof payload?.sub === "string" && payload.sub) ||
    fallbackEmail;
  const roles = Array.isArray(payload?.roles)
    ? (payload!.roles as string[]).map((r) => String(r))
    : [];

  return {
    email,
    role: mapRolesToUserRole(roles),
    roles,
    token,
  };
}

export class AuthApiRepository implements AuthRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_USERS_URL) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginFormData): Promise<AuthResult> {
    try {
      const response = await httpRequest<LoginApiResponse>("/api/auth/login", {
        method: "POST",
        body: credentials,
        auth: false,
        baseUrl: this.baseUrl,
      });

      const user = buildAuthUser(response.token, credentials.email);

      return {
        user,
        token: response.token,
      };
    } catch (err) {
      if (err instanceof HttpError) {
        if (err.status === 401 || err.status === 403) {
          throw new Error("Credenciales inválidas");
        }
        throw new Error(err.message);
      }
      throw new Error("No se pudo conectar con el servidor");
    }
  }
}

export const authRepository = new AuthApiRepository();
