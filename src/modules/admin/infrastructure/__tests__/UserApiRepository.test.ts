import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserApiRepository } from "../UserApiRepository";
import type { CreateUserPayload, UpdateUserPayload } from "../../domain/models/User";

vi.mock("../../../../shared/services/httpClient", () => ({
  httpRequest: vi.fn(),
  HttpError: class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = "HttpError";
      this.status = status;
    }
  },
}));

import { httpRequest } from "../../../../shared/services/httpClient";

const mockHttpRequest = vi.mocked(httpRequest);

describe("UserApiRepository", () => {
  let repo: UserApiRepository;

  beforeEach(() => {
    repo = new UserApiRepository("http://localhost:8083");
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("returns paginated response with users", async () => {
      const users = [
        { id: 1, name: "Alice", email: "alice@test.com", active: true },
        { id: 2, name: "Bob", email: "bob@test.com", active: false },
      ];
      const pageResponse = {
        content: users,
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 10,
        first: true,
        last: true,
        empty: false,
      };
      mockHttpRequest.mockResolvedValue(pageResponse);

      const result = await repo.list();
      expect(result).toEqual(pageResponse);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/users", {
        baseUrl: "http://localhost:8083", authScope: "users",
      });
    });

    it("passes active filter and pagination params as query params", async () => {
      mockHttpRequest.mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10, first: true, last: true, empty: true });

      await repo.list(true, 2, 5);
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/users?active=true&page=2&size=5",
        { baseUrl: "http://localhost:8083", authScope: "users" },
      );
    });

    it("maps 404 HttpError to UserError message", async () => {
      const { HttpError } = await import("../../../../shared/services/httpClient");
      mockHttpRequest.mockRejectedValue(new HttpError(404, "Not Found"));

      await expect(repo.list()).rejects.toThrow("Usuario no encontrado");
    });
  });

  describe("getById", () => {
    it("returns user by id", async () => {
      const user = { id: 1, name: "Alice", email: "alice@test.com" };
      mockHttpRequest.mockResolvedValue(user);

      const result = await repo.getById(1);
      expect(result).toEqual(user);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/users/1", {
        baseUrl: "http://localhost:8083", authScope: "users",
      });
    });
  });

  describe("create", () => {
    it("sends POST with payload and returns created user", async () => {
      const payload: CreateUserPayload = {
        name: "New",
        lastName: "User",
        email: "new@test.com",
        countryCode: "+56",
        phone: "999999999",
        password: "secret123",
        roleId: 1,
      };
      const created = { id: 3, ...payload };
      mockHttpRequest.mockResolvedValue(created);

      const result = await repo.create(payload);
      expect(result).toEqual(created);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        body: payload,
        baseUrl: "http://localhost:8083", authScope: "users",
      });
    });
  });

  describe("update", () => {
    it("sends PUT with payload and returns updated user", async () => {
      const payload: UpdateUserPayload = {
        name: "Updated",
        lastName: "User",
        countryCode: "+56",
        phone: "888888888",
        active: true,
      };
      const updated = { id: 1, ...payload, email: "existing@test.com" };
      mockHttpRequest.mockResolvedValue(updated);

      const result = await repo.update(1, payload);
      expect(result).toEqual(updated);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/users/1", {
        method: "PUT",
        body: payload,
        baseUrl: "http://localhost:8083", authScope: "users",
      });
    });
  });

  describe("delete", () => {
    it("sends DELETE request", async () => {
      mockHttpRequest.mockResolvedValue(undefined);

      await repo.delete(5);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/users/5", {
        method: "DELETE",
        baseUrl: "http://localhost:8083", authScope: "users",
      });
    });
  });

  describe("listAvailableRoles", () => {
    it("returns roles array from paginated or direct response", async () => {
      const roles = [
        { id: 1, name: "ADMIN", description: "Admin", active: true },
        { id: 2, name: "RECRUITER", description: "Recruiter", active: true },
      ];
      mockHttpRequest.mockResolvedValue({ content: roles, totalElements: 2, totalPages: 1, number: 0, size: 10, first: true, last: true, empty: false });

      const result = await repo.listAvailableRoles();
      expect(result).toEqual(roles);
    });

    it("handles direct array response", async () => {
      const roles = [{ id: 1, name: "ADMIN", description: "Admin", active: true }];
      mockHttpRequest.mockResolvedValue(roles);

      const result = await repo.listAvailableRoles();
      expect(result).toEqual(roles);
    });
  });
});
