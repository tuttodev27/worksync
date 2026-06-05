import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_USERS_URL } from "../../../shared/constants/forms";
import type { ModuleRepository } from "../domain/ports/ModuleRepository";
import type {
  Module,
  CreateModulePayload,
  UpdateModulePayload,
} from "../domain/models/Module";
function buildQuery(active?: boolean): string {
  if (active === undefined) return "";
  return `?active=${active}`;
}

function mapError(err: unknown): Error {
  if (err instanceof HttpError) {
    if (err.status === 401) return new Error("No autorizado");
    if (err.status === 403) return new Error("No tienes permisos para esta acción");
    if (err.status === 404) return new Error("Módulo no encontrado");
    if (err.status === 409) return new Error("El módulo ya existe");
    return new Error(err.message);
  }
  return new Error("No se pudo conectar con el servidor");
}

export class ModuleApiRepository implements ModuleRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_USERS_URL) {
    this.baseUrl = baseUrl;
  }

  async list(active?: boolean): Promise<Module[]> {
    try {
      return await httpRequest<Module[]>(`/api/modules${buildQuery(active)}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async getById(id: number): Promise<Module> {
    try {
      return await httpRequest<Module>(`/api/modules/${id}`, {
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async create(payload: CreateModulePayload): Promise<Module> {
    try {
      return await httpRequest<Module>("/api/modules", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async update(id: number, payload: UpdateModulePayload): Promise<Module> {
    try {
      return await httpRequest<Module>(`/api/modules/${id}`, {
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
      await httpRequest<void>(`/api/modules/${id}`, {
        method: "DELETE",
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      throw mapError(err);
    }
  }
}

export const moduleRepository = new ModuleApiRepository();
