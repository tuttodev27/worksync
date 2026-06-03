import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_USERS_URL } from "../../../shared/constants/forms";
import type { PermissionRepository } from "../domain/ports/PermissionRepository";
import type {
  Permission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from "../domain/models/Permission";

function buildQuery(active?: boolean): string {
  if (active === undefined) return "";
  return `?active=${active}`;
}

function mapError(err: unknown): Error {
  if (err instanceof HttpError) {
    if (err.status === 401) return new Error("No autorizado");
    if (err.status === 403) return new Error("No tienes permisos para esta acción");
    if (err.status === 404) return new Error("Permiso no encontrado");
    if (err.status === 409) return new Error("El permiso ya existe");
    return new Error(err.message);
  }
  return new Error("No se pudo conectar con el servidor");
}

export class PermissionApiRepository implements PermissionRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_USERS_URL) {
    this.baseUrl = baseUrl;
  }

  async list(active?: boolean): Promise<Permission[]> {
    try {
      return await httpRequest<Permission[]>(`/api/permissions${buildQuery(active)}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async getById(id: number): Promise<Permission> {
    try {
      return await httpRequest<Permission>(`/api/permissions/${id}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async create(payload: CreatePermissionPayload): Promise<Permission> {
    try {
      return await httpRequest<Permission>("/api/permissions", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async update(id: number, payload: UpdatePermissionPayload): Promise<Permission> {
    try {
      return await httpRequest<Permission>(`/api/permissions/${id}`, {
        method: "PUT",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await httpRequest<void>(`/api/permissions/${id}`, {
        method: "DELETE",
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }
}

export const permissionRepository = new PermissionApiRepository();
