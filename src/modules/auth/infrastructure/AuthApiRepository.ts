/**
 * Implementación del repositorio de autenticación
 * Infrastructure Layer - Capa de datos
 * Esta es la única parte que sabe Cómo hacer las llamadas HTTP
 * 
 * Si necesitas cambiar de mock a API real, solo modificas esta clase
 */

import type { AuthRepository, AuthResult } from "../domain/ports/AuthRepository";
import type { LoginFormData, RegisterFormData } from "../../../shared/types/forms";
import type { AuthUser } from "../../../shared/types/auth.type";
import { API_BASE_URL } from "../../../shared/constants/forms";

/**
 * Repositorio de autenticación - Implementación Mock
 * Cambiar a API real cuando backend esté disponible
 */
export class AuthApiRepository implements AuthRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginFormData): Promise<AuthResult> {
    // Mock implementation - reemplazar con llamado real cuando backend esté listo
    // try {
    //   const res = await fetch(`${this.baseUrl}/auth/login`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(credentials),
    //   });
    //   if (!res.ok) throw new Error("Login failed");
    //   return res.json();
    // } catch (e) {
    //   throw new AuthError("Error al iniciar sesión");
    // }

    // Mock: simular delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validación básica
    if (!credentials.email || !credentials.password) {
      throw new Error("Credenciales inválidas");
    }

    // Mock response
    const user: AuthUser = {
      id: 1,
      name: "Admin",
      email: credentials.email,
      role: "ADMIN",
      token: "mock-token-" + Date.now(),
    };

    return {
      user,
      token: user.token,
    };
  }

  async register(data: RegisterFormData): Promise<AuthUser> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Validar datos
    if (!data.email || !data.firstName) {
      throw new Error("Datos inválidos");
    }

    const user: AuthUser = {
      id: Date.now(),
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      role: data.userType as AuthUser["role"],
      token: "mock-token-" + Date.now(),
    };

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Guardar email para siguientes pasos
    sessionStorage.setItem("reset_email", email);
    
    // En producción, esto enviaría un email real
    console.log("📧 Email de recuperación enviado a:", email);
  }

  async verifyResetCode(code: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 700));
    
    // Código válido hardcodeado para demo
    return code === "123456";
  }

  async resetPassword(password: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Limpiar sesión temporal
    sessionStorage.removeItem("reset_email");
    sessionStorage.removeItem("reset_code_valid");
    
    console.log("🔐 Contraseña actualizada");
  }
}

// Instancia singleton para usar en toda la app
export const authRepository = new AuthApiRepository();
