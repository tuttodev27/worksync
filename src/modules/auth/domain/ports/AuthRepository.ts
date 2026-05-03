/**
 * Puerto de autenticación - Interface para el repositorio
 * DIP (Dependency Inversion Principle): зависи de abstracciones, no de concreciones
 * La UI no sabe cómo se implementa el login, solo conoce la interfaz
 */

import type { AuthUser } from "../../../../shared/types/auth.type";
import type { LoginFormData, RegisterFormData } from "../../../../shared/types/forms";

/**
 * Resultado de operación de autenticación
 */
export interface AuthResult {
  user: AuthUser;
  token: string;
}

/**
 * Puerto/Interfaz para el repositorio de autenticación
 * qualsquier implementador debe cumplir este contrato
 */
export interface AuthRepository {
  /**
   * Login con credenciales
   * @param credentials - Email y password
   * @returns Usuario y token
   */
  login(credentials: LoginFormData): Promise<AuthResult>;
  
  /**
   * Registrar nuevo usuario
   * @param data - Datos del usuario
   * @returns Usuario creado
   */
  register(data: RegisterFormData): Promise<AuthUser>;
  
  /**
   * Solicitar recuperación de contraseña
   * @param email - Email del usuario
   */
  forgotPassword(email: string): Promise<void>;
  
  /**
   * Validar código de recuperación
   * @param code - Código de 6 dígitos
   * @returns true si es válido
   */
  verifyResetCode(code: string): Promise<boolean>;
  
  /**
   * Restablecer contraseña
   * @param password - Nueva contraseña
   */
  resetPassword(password: string): Promise<void>;
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
