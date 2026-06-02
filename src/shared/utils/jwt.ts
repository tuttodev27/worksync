/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * Se usa SOLO para extraer información de presentación (email, roles)
 * NO se debe usar para decisiones de seguridad en el cliente.
 */

export interface JwtPayload {
  sub?: string;
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4;
  const final = padding ? padded + "=".repeat(4 - padding) : padded;
  return atob(final);
}

export function decodeJwt(token: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
