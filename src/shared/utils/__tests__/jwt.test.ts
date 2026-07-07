import { describe, it, expect } from "vitest";
import { decodeJwt } from "../jwt";

function b64Url(json: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(json))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encoded;
}

function makeToken(header: string, payload: string, signature = "fake-sig") {
  return `${header}.${payload}.${signature}`;
}

describe("decodeJwt", () => {
  it("decodes a valid JWT payload", () => {
    const payload = { sub: "123", email: "test@test.com", roles: ["ADMIN"] };
    const token = makeToken(b64Url({ alg: "HS256" }), b64Url(payload));
    const result = decodeJwt(token);
    expect(result).not.toBeNull();
    expect(result!.sub).toBe("123");
    expect(result!.email).toBe("test@test.com");
    expect(result!.roles).toEqual(["ADMIN"]);
  });

  it("returns null for empty token", () => {
    expect(decodeJwt("")).toBeNull();
  });

  it("returns null for token with wrong parts count", () => {
    expect(decodeJwt("part1.part2")).toBeNull();
    expect(decodeJwt("part1")).toBeNull();
  });

  it("returns null for invalid base64 payload", () => {
    const token = makeToken("header", "not-valid-base64!!!");
    expect(decodeJwt(token)).toBeNull();
  });

  it("returns null for non-JSON payload", () => {
    const encoded = btoa("not-json").replace(/=/g, "");
    const token = makeToken(b64Url({ alg: "HS256" }), encoded);
    expect(decodeJwt(token)).toBeNull();
  });

  it("extracts extra fields from payload", () => {
    const payload = { name: "John", iat: 1234567890, exp: 1234567899 };
    const token = makeToken(b64Url({ alg: "HS256" }), b64Url(payload));
    const result = decodeJwt(token);
    expect(result!.name).toBe("John");
    expect(result!.iat).toBe(1234567890);
    expect(result!.exp).toBe(1234567899);
  });
});
