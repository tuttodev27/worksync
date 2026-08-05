// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCandidateStatuses } from "../useCandidateStatuses";
import type { CandidateStatusResponse } from "../../domain/types";

const statuses: CandidateStatusResponse[] = [
  { code: "NEW", label: "Nuevo" },
  { code: "IN_REVIEW", label: "En revisión" },
  { code: "INTERVIEW", label: "Entrevista" },
  { code: "SHORTLIST", label: "Finalista" },
  { code: "REJECTED", label: "Rechazado" },
  { code: "HIRED", label: "Contratado" },
];

vi.mock("../../infrastructure/CandidateApiRepository", () => ({
  candidateRepository: {
    listStatuses: vi.fn(),
  },
}));

import { candidateRepository } from "../../infrastructure/CandidateApiRepository";
const mockedListStatuses = vi.mocked(candidateRepository.listStatuses);

describe("useCandidateStatuses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads statuses and maps codes to labels", async () => {
    mockedListStatuses.mockResolvedValue(statuses);

    const { result } = renderHook(() => useCandidateStatuses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedListStatuses).toHaveBeenCalledTimes(1);
    expect(result.current.statuses).toHaveLength(6);
    expect(result.current.statusLabel("IN_REVIEW")).toBe("En revisión");
  });

  it("returns the code itself when it is not in the catalog", async () => {
    mockedListStatuses.mockResolvedValue(statuses);

    const { result } = renderHook(() => useCandidateStatuses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.statusLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("returns '-' when no code is provided", async () => {
    mockedListStatuses.mockResolvedValue(statuses);

    const { result } = renderHook(() => useCandidateStatuses());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.statusLabel()).toBe("-");
  });

  it("sets error when loading fails", async () => {
    mockedListStatuses.mockRejectedValue(new Error("No se pudieron cargar los estados."));

    const { result } = renderHook(() => useCandidateStatuses());

    await waitFor(() => {
      expect(result.current.error).toBe("No se pudieron cargar los estados.");
    });

    expect(result.current.statuses).toHaveLength(0);
  });

  it("reloads statuses when refresh is called", async () => {
    mockedListStatuses.mockResolvedValue(statuses);

    const { result } = renderHook(() => useCandidateStatuses());

    await waitFor(() => {
      expect(mockedListStatuses).toHaveBeenCalledTimes(1);
    });

    mockedListStatuses.mockResolvedValue([
      { code: "NEW", label: "Nuevo" },
      { code: "HIRED", label: "Contratado" },
    ]);

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.statuses).toHaveLength(2);
    });

    expect(mockedListStatuses).toHaveBeenCalledTimes(2);
  });
});
