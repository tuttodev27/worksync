import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { httpRequest, HttpError } from "../httpClient";

interface MockStore {
  [key: string]: string;
}

function createMockWindow(store: MockStore) {
  return {
    localStorage: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
      length: 0,
      key: vi.fn(() => null),
    },
    location: { pathname: "/", href: "" },
  };
}

beforeEach(() => {
  const store: MockStore = {};
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("window", createMockWindow(store));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("httpRequest", () => {
  it("performs a GET request and returns parsed JSON", async () => {
    const data = { id: 1, name: "Test" };
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
      }),
    );

    const result = await httpRequest<typeof data>("/api/test");
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledWith("/api/test", expect.any(Object));
  });

  it("includes Authorization header when auth is true (default)", async () => {
    window.localStorage.setItem("token", "bearer-token");
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      }),
    );

    await httpRequest("/api/test");
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]!.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer bearer-token");
  });

  it("omits Authorization header when auth is false", async () => {
    window.localStorage.setItem("token", "bearer-token");
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      }),
    );

    await httpRequest("/api/test", { auth: false });
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]!.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("sets Content-Type to application/json for object bodies", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      }),
    );

    await httpRequest("/api/test", { method: "POST", body: { name: "test" } });
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]!.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not set Content-Type for FormData bodies", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      }),
    );
    const formData = new FormData();

    await httpRequest("/api/test", { method: "POST", body: formData });
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = call[1]!.headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("throws HttpError on non-ok response", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Bad request" }),
        text: () => Promise.resolve("Bad request"),
      }),
    );

    await expect(httpRequest("/api/test")).rejects.toThrow(HttpError);
    await expect(httpRequest("/api/test")).rejects.toThrow("Bad request");
  });

  it("throws HttpError with correct status code", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Not found" }),
        text: () => Promise.resolve("Not found"),
      }),
    );

    try {
      await httpRequest("/api/test");
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as HttpError).status).toBe(404);
    }
  });

  it("returns undefined for 204 No Content", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
        json: () => Promise.resolve(null),
        text: () => Promise.resolve(""),
      }),
    );

    const result = await httpRequest("/api/test");
    expect(result).toBeUndefined();
  });

  it("handles 401 by clearing session for users service", async () => {
    window.localStorage.setItem("token", "expired");
    window.localStorage.setItem("authUser", JSON.stringify({ email: "test@test.com" }));
    window.location.pathname = "/admin";
    window.location.href = "";

    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Unauthorized" }),
        text: () => Promise.resolve("Unauthorized"),
      }),
    );

    await expect(
      httpRequest("/api/users", { baseUrl: "http://localhost:8083", authScope: "users" }),
    ).rejects.toThrow(HttpError);
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.localStorage.getItem("authUser")).toBeNull();
  });

  it("throws HttpError for 401 on candidates service", async () => {
    window.localStorage.setItem("token", "expired");
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({ message: "Token expired" }),
        text: () => Promise.resolve("Token expired"),
      }),
    );

    await expect(
      httpRequest("/api/candidates", { baseUrl: "http://localhost:8084", authScope: "candidates" }),
    ).rejects.toThrow(HttpError);
  });

  it("uses provided baseUrl to construct the request URL", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      }),
    );

    await httpRequest("/api/test", { baseUrl: "http://localhost:8083" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8083/api/test",
      expect.any(Object),
    );
  });

  it("handles text responses when content-type is not JSON", async () => {
    vi.mocked(fetch).mockImplementation(
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/plain" }),
        json: () => Promise.reject(new Error("not json")),
        text: () => Promise.resolve("plain text"),
      }),
    );

    const result = await httpRequest<string>("/api/test");
    expect(result).toBe("plain text");
  });
});
