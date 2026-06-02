/**
 * Implementación HTTP del repositorio de usuarios
 * Esta es la única parte que sabe cómo hablar con /api/users
 */

import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import type { UserRepository } from "../domain/ports/UserRepository";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
} from "../domain/models/User";

function buildQuery(active?: boolean): string {
  if (active === undefined) return "";
  return `?active=${active}`;
}

function mapError(err: unknown): Error {
  if (err instanceof HttpError) {
    if (err.status === 401) return new Error("No autorizado");
    if (err.status === 403) return new Error("No tienes permisos para esta acción");
    if (err.status === 404) return new Error("Usuario no encontrado");
    if (err.status === 409) return new Error("El usuario ya existe");
    return new Error(err.message);
  }
  return new Error("No se pudo conectar con el servidor");
}

export class UserApiRepository implements UserRepository {
  async list(active?: boolean): Promise<User[]> {
    try {
      return await httpRequest<User[]>(`/api/users${buildQuery(active)}`);
    } catch (err) {
      throw mapError(err);
    }
  }

  async getById(id: number): Promise<User> {
    try {
      return await httpRequest<User>(`/api/users/${id}`);
    } catch (err) {
      throw mapError(err);
    }
  }

  async create(payload: CreateUserPayload): Promise<User> {
    try {
      return await httpRequest<User>("/api/users", {
        method: "POST",
        body: payload,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    try {
      return await httpRequest<User>(`/api/users/${id}`, {
        method: "PUT",
        body: payload,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await httpRequest<void>(`/api/users/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async listAvailableRoles(): Promise<string[]> {
    try {
      return await httpRequest<string[]>("/api/users/roles");
    } catch (err) {
      throw mapError(err);
    }
  }
}

export const userRepository = new UserApiRepository();
