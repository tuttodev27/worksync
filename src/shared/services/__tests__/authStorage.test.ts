import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getAuthUser,
  getToken,
  saveAuthUser,
  clearAuthUser,
} from "../authStorage";
import type { AuthUser } from "../../types/auth.type";

function mockLocalStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    length: 0,
    key: vi.fn(() => null),
  };
}

const mockUser: AuthUser = {
  email: "admin@test.com",
  role: "ADMIN",
  token: "jwt-token-123",
  roles: ["ADMIN"],
};

beforeEach(() => {
  const ls = mockLocalStorage();
  vi.stubGlobal("localStorage", ls);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getAuthUser", () => {
  it("returns null when no authUser in storage", () => {
    expect(getAuthUser()).toBeNull();
  });

  it("returns parsed user when authUser exists", () => {
    localStorage.setItem("authUser", JSON.stringify(mockUser));
    const result = getAuthUser();
    expect(result).toEqual(mockUser);
  });

  it("returns null when stored value is invalid JSON", () => {
    localStorage.setItem("authUser", "not-json");
    expect(getAuthUser()).toBeNull();
  });

  it("returns null when stored value is empty string", () => {
    localStorage.setItem("authUser", "");
    expect(getAuthUser()).toBeNull();
  });
});

describe("getToken", () => {
  it("returns null when token key is missing", () => {
    expect(getToken()).toBeNull();
  });

  it("returns token string when present", () => {
    localStorage.setItem("token", "my-token");
    expect(getToken()).toBe("my-token");
  });
});

describe("saveAuthUser", () => {
  it("saves user and token to localStorage", () => {
    saveAuthUser(mockUser);
    expect(localStorage.getItem("authUser")).toBe(JSON.stringify(mockUser));
    expect(localStorage.getItem("token")).toBe(mockUser.token);
  });
});

describe("clearAuthUser", () => {
  it("removes authUser and token from localStorage", () => {
    localStorage.setItem("authUser", JSON.stringify(mockUser));
    localStorage.setItem("token", mockUser.token);
    clearAuthUser();
    expect(localStorage.getItem("authUser")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
