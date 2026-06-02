/**
 * Puerto de autenticación - Interface para el repositorio
 * DIP (Dependency Inversion Principle): depende de abstracciones, no de concreciones
 * La UI no sabe cómo se implementa el login, solo conoce la interfaz
 */

import type { AuthUser } from "../../../../shared/types/auth.type";
import type { LoginFormData } from "../../../../shared/types/forms";

/**
 * Resultado de operación de autenticación
 */
export interface AuthResult {
  user: AuthUser;
  token: string;
}

/**
 * Puerto/Interfaz para el repositorio de autenticación
 * Cualquier implementador debe cumplir este contrato
 */
export interface AuthRepository {
  /**
   * Login con credenciales contra el backend
   */
  login(credentials: LoginFormData): Promise<AuthResult>;
}

/**
 * Error personalizado para auth
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
