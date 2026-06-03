/**
 * Candidate API Repository.
 * Implementacion HTTP del repositorio de candidatos contra ats-postulant.
 */

import { httpRequest, HttpError } from "../../../shared/services/httpClient";
import { API_CANDIDATE_URL } from "../../../shared/constants/forms";
import type {
  CreateCandidatePayload,
  CandidateApiResponse,
  PageResponse,
  UpdateCandidatePayload,
  AttachmentResponse,
} from "../domain/types";

export class CandidateApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "CandidateApiError";
    this.status = status;
    this.code = code;
  }
}

function toApiError(err: unknown): never {
  if (err instanceof HttpError) {
    const body = err.body as { code?: string; message?: string } | undefined;
    throw new CandidateApiError(
      err.status,
      body?.message ?? err.message,
      body?.code,
    );
  }
  if (err instanceof Error) throw err;
  throw new Error("No se pudo conectar con el servidor");
}

export class CandidateApiRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_CANDIDATE_URL) {
    this.baseUrl = baseUrl;
  }

  async create(payload: CreateCandidatePayload): Promise<CandidateApiResponse> {
    try {
      return await httpRequest<CandidateApiResponse>("/api/candidates", {
        method: "POST",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async list(
    params: {
      active?: boolean;
      search?: string;
      page?: number;
      size?: number;
    } = {},
  ): Promise<PageResponse<CandidateApiResponse>> {
    const search = new URLSearchParams();
    if (params.active !== undefined) {
      search.set("active", String(params.active));
    }
    if (params.search) {
      search.set("search", params.search);
    }
    if (params.page !== undefined) {
      search.set("page", String(params.page));
    }
    if (params.size !== undefined) {
      search.set("size", String(params.size));
    }
    const query = search.toString();
    try {
      return await httpRequest<PageResponse<CandidateApiResponse>>(
        `/api/candidates${query ? `?${query}` : ""}`,
        { method: "GET", baseUrl: this.baseUrl },
      );
    } catch (err) {
      toApiError(err);
    }
  }

  async getById(id: number): Promise<CandidateApiResponse> {
    try {
      return await httpRequest<CandidateApiResponse>(`/api/candidates/${id}`, {
        method: "GET",
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async update(
    id: number,
    payload: UpdateCandidatePayload,
  ): Promise<CandidateApiResponse> {
    try {
      return await httpRequest<CandidateApiResponse>(`/api/candidates/${id}`, {
        method: "PUT",
        body: payload,
        baseUrl: this.baseUrl,
      });
    } catch (err) {
      toApiError(err);
    }
  }

  async uploadAttachment(
    candidateId: number,
    file: File,
  ): Promise<AttachmentResponse> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      return await httpRequest<AttachmentResponse>(
        `/api/candidates/${candidateId}/attachments`,
        {
          method: "POST",
          body: formData,
          baseUrl: this.baseUrl,
          headers: {},
        },
      );
    } catch (err) {
      toApiError(err);
    }
  }

  async listAttachments(
    candidateId: number,
  ): Promise<AttachmentResponse[]> {
    try {
      return await httpRequest<AttachmentResponse[]>(
        `/api/candidates/${candidateId}/attachments`,
        { method: "GET", baseUrl: this.baseUrl },
      );
    } catch (err) {
      toApiError(err);
    }
  }
}

export const candidateRepository = new CandidateApiRepository();
