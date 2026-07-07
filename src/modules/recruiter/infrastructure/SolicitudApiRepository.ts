import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_CANDIDATE_URL } from "../../../shared/constants/forms";
import type { PageResponse } from "../../../shared/types/api";
import type {
  CreateSolicitudPayload,
  UpdateSolicitudPayload,
  SolicitudApiResponse,
} from "../domain/types";

export class SolicitudApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "SolicitudApiError";
    this.status = status;
    this.code = code;
  }
}

function toApiError(err: unknown): never {
  if (err instanceof HttpError) {
    const body = err.body as { code?: string; message?: string } | undefined;
    throw new SolicitudApiError(
      err.status,
      body?.message ?? err.message,
      body?.code,
    );
  }
  if (err instanceof Error) throw err;
  throw new Error("No se pudo conectar con el servidor");
}

export class SolicitudApiRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_CANDIDATE_URL) {
    this.baseUrl = baseUrl;
  }

  async create(payload: CreateSolicitudPayload): Promise<SolicitudApiResponse> {
    try {
      return await httpRequest<SolicitudApiResponse>("/api/solicitudes", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl, authScope: "candidates",
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async list(params: {
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<SolicitudApiResponse>> {
    const search = new URLSearchParams();
    if (params.page !== undefined) {
      search.set("page", String(params.page));
    }
    if (params.size !== undefined) {
      search.set("size", String(params.size));
    }
    const query = search.toString();
    try {
      return await httpRequest<PageResponse<SolicitudApiResponse>>(
        `/api/solicitudes${query ? `?${query}` : ""}`,
        { method: "GET", baseUrl: this.baseUrl, authScope: "candidates" },
      );
    } catch (err) {
      toApiError(err);
    }
  }

  async getById(id: number): Promise<SolicitudApiResponse> {
    try {
      return await httpRequest<SolicitudApiResponse>(`/api/solicitudes/${id}`, {
        method: "GET",
        baseUrl: this.baseUrl, authScope: "candidates",
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async update(id: number, payload: UpdateSolicitudPayload): Promise<SolicitudApiResponse> {
    try {
      return await httpRequest<SolicitudApiResponse>(`/api/solicitudes/${id}`, {
        method: "PUT",
        body: payload,
        baseUrl: this.baseUrl, authScope: "candidates",
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await httpRequest<void>(`/api/solicitudes/${id}`, {
        method: "DELETE",
        baseUrl: this.baseUrl, authScope: "candidates",
      });
    } catch (err) {
      toApiError(err);
    }
  }
}

export const solicitudRepository = new SolicitudApiRepository();
