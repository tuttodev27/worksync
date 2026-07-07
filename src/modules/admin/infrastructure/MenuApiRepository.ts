import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_USERS_URL } from "../../../shared/constants/forms";
import type { MenuRepository } from "../domain/ports/MenuRepository";
import type {
  Menu,
  CreateMenuPayload,
  UpdateMenuPayload,
} from "../domain/models/Menu";
function buildQuery(active?: boolean): string {
  if (active === undefined) return "";
  return `?active=${active}`;
}

function mapError(err: unknown): Error {
  if (err instanceof HttpError) {
    if (err.status === 401) return new Error("No autorizado");
    if (err.status === 403) return new Error("No tienes permisos para esta acción");
    if (err.status === 404) return new Error("Menú no encontrado");
    if (err.status === 409) return new Error("El menú ya existe");
    return new Error(err.message);
  }
  return new Error("No se pudo conectar con el servidor");
}

export class MenuApiRepository implements MenuRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_USERS_URL) {
    this.baseUrl = baseUrl;
  }

  async list(active?: boolean): Promise<Menu[]> {
    try {
      return await httpRequest<Menu[]>(`/api/menus${buildQuery(active)}`, {
        baseUrl: this.baseUrl, authScope: "users",
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async getById(id: number): Promise<Menu> {
    try {
      return await httpRequest<Menu>(`/api/menus/${id}`, {
        baseUrl: this.baseUrl, authScope: "users",
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async create(payload: CreateMenuPayload): Promise<Menu> {
    try {
      return await httpRequest<Menu>("/api/menus", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl, authScope: "users",
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async update(id: number, payload: UpdateMenuPayload): Promise<Menu> {
    try {
      return await httpRequest<Menu>(`/api/menus/${id}`, {
        method: "PUT",
        body: payload,
        baseUrl: this.baseUrl, authScope: "users",
      });
    } catch (err) {
      throw mapError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await httpRequest<void>(`/api/menus/${id}`, {
        method: "DELETE",
        baseUrl: this.baseUrl, authScope: "users",
      });
    } catch (err) {
      throw mapError(err);
    }
  }
}

export const menuRepository = new MenuApiRepository();
