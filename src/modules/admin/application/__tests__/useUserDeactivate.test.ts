// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserDeactivate } from "../useUserDeactivate";
import type { UserRepository } from "../../domain/ports/UserRepository";

function createMockRepo(overrides?: Partial<UserRepository>): UserRepository {
  return {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn().mockResolvedValue({ id: 1, active: false }),
    listAvailableRoles: vi.fn(),
    ...overrides,
  };
}

describe("useUserDeactivate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls repository.deactivate with the user id", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useUserDeactivate(repo));

    await act(async () => {
      await result.current.deactivateUser(5);
    });

    expect(repo.deactivate).toHaveBeenCalledWith(5);
  });

  it("sets error when deactivation fails", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue(new Error("Cannot deactivate")),
    });
    const { result } = renderHook(() => useUserDeactivate(repo));

    const promise = result.current.deactivateUser(5);
    await expect(promise).rejects.toThrow("Cannot deactivate");

    await waitFor(() => {
      expect(result.current.error).toBe("Cannot deactivate");
    });
  });

  it("sets generic error for non-Error exceptions", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue("unknown"),
    });
    const { result } = renderHook(() => useUserDeactivate(repo));

    const promise = result.current.deactivateUser(5);
    await expect(promise).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe("No se pudo desactivar el usuario");
    });
  });

  it("re-throws error after setting error state", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue(new Error("fail")),
    });
    const { result } = renderHook(() => useUserDeactivate(repo));

    await expect(
      result.current.deactivateUser(1)
    ).rejects.toThrow("fail");
  });
});
