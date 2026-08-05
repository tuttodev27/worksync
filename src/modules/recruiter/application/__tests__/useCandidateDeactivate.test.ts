// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCandidateDeactivate } from "../useCandidateDeactivate";
import type { CandidateApiRepository } from "../../infrastructure/CandidateApiRepository";

function createMockRepo(overrides?: Partial<Pick<CandidateApiRepository, "deactivate">>): Pick<CandidateApiRepository, "deactivate"> {
  return {
    deactivate: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("useCandidateDeactivate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls repository.deactivate with the candidate id", async () => {
    const repo = createMockRepo();
    const { result } = renderHook(() => useCandidateDeactivate(repo));

    await act(async () => {
      await result.current.deactivateCandidate(5);
    });

    expect(repo.deactivate).toHaveBeenCalledWith(5);
  });

  it("sets error when deactivation fails", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue(new Error("Cannot deactivate")),
    });
    const { result } = renderHook(() => useCandidateDeactivate(repo));

    const promise = result.current.deactivateCandidate(5);
    await expect(promise).rejects.toThrow("Cannot deactivate");

    await waitFor(() => {
      expect(result.current.error).toBe("Cannot deactivate");
    });
  });

  it("sets generic error for non-Error exceptions", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue("unknown"),
    });
    const { result } = renderHook(() => useCandidateDeactivate(repo));

    const promise = result.current.deactivateCandidate(5);
    await expect(promise).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe("No se pudo desactivar el postulante");
    });
  });

  it("re-throws error after setting error state", async () => {
    const repo = createMockRepo({
      deactivate: vi.fn().mockRejectedValue(new Error("fail")),
    });
    const { result } = renderHook(() => useCandidateDeactivate(repo));

    await expect(
      result.current.deactivateCandidate(1)
    ).rejects.toThrow("fail");
  });
});
