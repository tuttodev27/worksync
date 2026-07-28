// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserList } from "../useUserList";
import type { UserRepository } from "../../domain/ports/UserRepository";
import type { PageResponse } from "../../../../shared/types/api";

function makePageResponse<T>(content: T[], total = content.length): PageResponse<T> {
  return {
    content,
    totalElements: total,
    totalPages: Math.ceil(total / 10),
    number: 0,
    size: 10,
    first: true,
    last: total <= 10,
    empty: content.length === 0,
  };
}

const mockUsers = [
  { id: 1, name: "Alice", lastName: "A", email: "alice@test.com", active: true, roles: ["ADMIN"], createdAt: "", countryCode: "+56", phone: "9" },
  { id: 2, name: "Bob", lastName: "B", email: "bob@test.com", active: false, roles: ["RECRUITER"], createdAt: "", countryCode: "+56", phone: "8" },
];

function createMockRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    list: vi.fn().mockResolvedValue(makePageResponse(mockUsers)),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    listAvailableRoles: vi.fn(),
    ...overrides,
  };
}

describe("useUserList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads users on mount", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserList(repo));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe("");
    expect(repo.list).toHaveBeenCalledWith(undefined, 0, 10);
  });

  it("sets error when repository fails", async () => {
    const repo = createMockRepo({
      list: vi.fn().mockRejectedValue(new Error("Server error")),
    });
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Server error");
    expect(result.current.users).toEqual([]);
  });

  it("sets generic error for non-Error exceptions", async () => {
    const repo = createMockRepo({
      list: vi.fn().mockRejectedValue("unknown"),
    });
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error al cargar usuarios");
  });

  it("resets page to 0 when filter changes", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(repo.list).toHaveBeenCalledWith(undefined, 2, 10);
    });

    act(() => {
      result.current.setActiveFilter(true);
    });

    await waitFor(() => {
      expect(repo.list).toHaveBeenCalledWith(true, 0, 10);
    });
  });

  it("passes active filter to repository", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setActiveFilter(false);
    });

    await waitFor(() => {
      expect(repo.list).toHaveBeenCalledWith(false, 0, 10);
    });
  });

  it("refresh reloads current data", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = (repo.list as ReturnType<typeof vi.fn>).mock.calls.length;

    await act(async () => {
      await result.current.refresh();
    });

    expect((repo.list as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount + 1);
  });

  it("computes totalPages from response", async () => {
    const repo = createMockRepo({
      list: vi.fn().mockResolvedValue(makePageResponse(mockUsers, 25)),
    });
    const { result } = renderHook(() => useUserList(repo));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalPages).toBe(3);
  });

  it("uses custom page size", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserList(repo, 5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(repo.list).toHaveBeenCalledWith(undefined, 0, 5);
  });
});
