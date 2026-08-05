// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCandidateAttachments } from "../useCandidateAttachments";
import type { AttachmentResponse } from "../../domain/types";

const attachments: AttachmentResponse[] = [
  {
    id: 1,
    candidateId: 10,
    fileName: "cv.pdf",
    fileUrl: "candidates/10/cv.pdf",
    fileType: "application/pdf",
    fileSize: 2048,
    parseStatus: "COMPLETED",
  },
];

vi.mock("../../infrastructure/CandidateApiRepository", () => ({
  candidateRepository: {
    listAttachments: vi.fn(),
  },
}));

import { candidateRepository } from "../../infrastructure/CandidateApiRepository";
const mockedListAttachments = vi.mocked(candidateRepository.listAttachments);

describe("useCandidateAttachments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads attachments for the candidate", async () => {
    mockedListAttachments.mockResolvedValue(attachments);

    const { result } = renderHook(() => useCandidateAttachments(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedListAttachments).toHaveBeenCalledWith(10);
    expect(result.current.attachments).toEqual(attachments);
  });

  it("does not load when candidate id is missing", async () => {
    const { result } = renderHook(() => useCandidateAttachments(undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedListAttachments).not.toHaveBeenCalled();
  });

  it("sets error when loading fails", async () => {
    mockedListAttachments.mockRejectedValue(new Error("No se pudieron cargar los archivos adjuntos."));

    const { result } = renderHook(() => useCandidateAttachments(10));

    await waitFor(() => {
      expect(result.current.error).toBe("No se pudieron cargar los archivos adjuntos.");
    });

    expect(result.current.attachments).toHaveLength(0);
  });

  it("reloads attachments when refresh is called", async () => {
    mockedListAttachments.mockResolvedValue(attachments);

    const { result } = renderHook(() => useCandidateAttachments(10));

    await waitFor(() => {
      expect(mockedListAttachments).toHaveBeenCalledTimes(1);
    });

    mockedListAttachments.mockResolvedValue([]);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.attachments).toHaveLength(0);
    });

    expect(mockedListAttachments).toHaveBeenCalledTimes(2);
  });

  it("appends attachment after an upload", async () => {
    mockedListAttachments.mockResolvedValue(attachments);

    const { result } = renderHook(() => useCandidateAttachments(10));

    await waitFor(() => {
      expect(result.current.attachments).toHaveLength(1);
    });

    const uploaded: AttachmentResponse = {
      id: 2,
      candidateId: 10,
      fileName: "cv2.pdf",
      fileUrl: "candidates/10/cv2.pdf",
      fileType: "application/pdf",
      parseStatus: "PENDING",
    };

    act(() => {
      result.current.addAttachment(uploaded);
    });

    expect(result.current.attachments).toHaveLength(2);
    expect(result.current.attachments[1]).toEqual(uploaded);
  });

  it("clears the error", async () => {
    mockedListAttachments.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useCandidateAttachments(10));

    await waitFor(() => {
      expect(result.current.error).toBe("boom");
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe("");
  });
});
