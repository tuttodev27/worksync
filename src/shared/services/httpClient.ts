/**
 * Cliente HTTP compartido
 * SRP: Centraliza la configuración de fetch, headers y manejo de errores.
 * Acepta una baseUrl por llamada para soportar multiples microservicios.
 */

export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  baseUrl?: string;
};

const TOKEN_STORAGE_KEY = "token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("authUser");
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function parseErrorBody(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { message?: string; code?: string };
      return data.message ?? data.code ?? `HTTP ${response.status}`;
    }
    const text = await response.text();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function httpRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers, baseUrl, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getStoredToken();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${baseUrl ?? ""}${path}`;
  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

  if (response.status === 401 && auth) {
  const isAuthService = (baseUrl ?? "").includes("8083");
  if (isAuthService) {
    clearStoredSession();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/login";
    }
  } else {
    const message = await parseErrorBody(response);
    throw new HttpError(response.status, message);
  }
}

  if (!response.ok) {
    const message = await parseErrorBody(response);
    throw new HttpError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}
