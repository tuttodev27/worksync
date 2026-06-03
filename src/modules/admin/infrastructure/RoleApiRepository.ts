import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_USERS_URL } from "../../../shared/constants/forms";
import type { RoleRepository } from "../domain/ports/RoleRepository";
import type {
  Role,
  CreateRolePayload,
  UpdateRolePayload,
} from "../domain/models/Role";

function buildQuery(active?: boolean): string {
  if (active === undefined) return "";
  return `?active=${active}`;
}

function mapError(err: unknown): Error {
  if (err instanceof HttpError) {
    if (err.status === 401) return new Error("No autorizado");
    if (err.status === 403) return new Error("No tienes permisos para esta acción");
    if (err.status === 404) return new Error("Rol no encontrado");
    if (err.status === 409) return new Error("El rol ya existe");
    return new Error(err.message);
  }
  return new Error("No se pudo conectar con el servidor");
}

export class RoleApiRepository implements RoleRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_USERS_URL) {
    this.baseUrl = baseUrl;
  }

  async list(active?: boolean): Promise<Role[]> {
    try {
      return await httpRequest<Role[]>(`/api/roles${buildQuery(active)}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async getById(id: number): Promise<Role> {
    try {
      return await httpRequest<Role>(`/api/roles/${id}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async create(payload: CreateRolePayload): Promise<Role> {
    try {
      return await httpRequest<Role>("/api/roles", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async update(id: number, payload: UpdateRolePayload): Promise<Role> {
    try {
      return await httpRequest<Role>(`/api/roles/${id}`, {
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
      await httpRequest<void>(`/api/roles/${id}`, {
        method: "DELETE",
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }
}

export const roleRepository = new RoleApiRepository();
