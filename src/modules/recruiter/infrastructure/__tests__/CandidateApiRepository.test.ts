import { describe, it, expect, beforeEach, vi } from "vitest";
import { CandidateApiRepository } from "../CandidateApiRepository";

vi.mock("../../../../shared/services/httpClient", () => ({
  httpRequest: vi.fn(),
  HttpError: class HttpError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, message: string, body?: unknown) {
      super(message);
      this.name = "HttpError";
      this.status = status;
      this.body = body;
    }
  },
}));

import { httpRequest, HttpError } from "../../../../shared/services/httpClient";

const mockHttpRequest = vi.mocked(httpRequest);

const mockCandidate = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  active: true,
  createdAt: "2026-01-01T00:00:00Z",
};

const mockPageResponse = {
  content: [mockCandidate],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

describe("CandidateApiRepository", () => {
  let repo: CandidateApiRepository;

  beforeEach(() => {
    repo = new CandidateApiRepository("http://localhost:8084");
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("sends POST and returns created candidate", async () => {
      const payload = {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
      };
      mockHttpRequest.mockResolvedValue(mockCandidate);

      const result = await repo.create(payload);
      expect(result).toEqual(mockCandidate);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/candidates", {
        method: "POST",
        body: payload,
        baseUrl: "http://localhost:8084", authScope: "candidates",
      });
    });
  });

  describe("list", () => {
    it("returns paginated candidates", async () => {
      mockHttpRequest.mockResolvedValue(mockPageResponse);

      const result = await repo.list({ page: 0, size: 10 });
      expect(result).toEqual(mockPageResponse);
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/candidates?page=0&size=10",
        { method: "GET", baseUrl: "http://localhost:8084", authScope: "candidates" },
      );
    });

    it("includes search param when provided", async () => {
      mockHttpRequest.mockResolvedValue(mockPageResponse);

      await repo.list({ search: "john" });
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/candidates?search=john",
        { method: "GET", baseUrl: "http://localhost:8084", authScope: "candidates" },
      );
    });
  });

  describe("getById", () => {
    it("returns candidate by id", async () => {
      mockHttpRequest.mockResolvedValue(mockCandidate);

      const result = await repo.getById(1);
      expect(result).toEqual(mockCandidate);
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/candidates/1", {
        method: "GET",
        baseUrl: "http://localhost:8084", authScope: "candidates",
      });
    });
  });

  describe("update", () => {
    it("sends PUT with partial payload", async () => {
      const payload = { phone: "+56999999999" };
      mockHttpRequest.mockResolvedValue({ ...mockCandidate, ...payload });

      const result = await repo.update(1, payload);
      expect(result.phone).toBe("+56999999999");
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/candidates/1", {
        method: "PUT",
        body: payload,
        baseUrl: "http://localhost:8084", authScope: "candidates",
      });
    });
  });

  describe("uploadAttachment", () => {
    it("sends POST with FormData containing the file", async () => {
      const file = new File(["pdf-content"], "cv.pdf", { type: "application/pdf" });
      const mockResponse = { id: 1, fileName: "cv.pdf", fileUrl: "/files/1" };
      mockHttpRequest.mockResolvedValue(mockResponse);

      const result = await repo.uploadAttachment(1, file);
      expect(result).toEqual(mockResponse);
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/candidates/1/attachments",
        expect.objectContaining({
          method: "POST",
          headers: {},
          baseUrl: "http://localhost:8084", authScope: "candidates",
        }),
      );
      const callBody = mockHttpRequest.mock.calls[0][1]?.body;
      expect(callBody).toBeInstanceOf(FormData);
    });
  });

  describe("listAttachments", () => {
    it("returns attachments array", async () => {
      const attachments = [
        { id: 1, fileName: "cv.pdf", fileUrl: "/files/1" },
      ];
      mockHttpRequest.mockResolvedValue(attachments);

      const result = await repo.listAttachments(1);
      expect(result).toEqual(attachments);
    });
  });

  describe("parseAttachment", () => {
    it("sends POST parse request", async () => {
      mockHttpRequest.mockResolvedValue(mockCandidate);

      const result = await repo.parseAttachment(1, 5);
      expect(result).toEqual(mockCandidate);
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/candidates/1/attachments/5/parse",
        { method: "POST", baseUrl: "http://localhost:8084", authScope: "candidates" },
      );
    });
  });

  describe("updateStatus", () => {
    it("sends PATCH with status change", async () => {
      mockHttpRequest.mockResolvedValue({
        ...mockCandidate,
        currentState: "IN_REVIEW",
      });

      const result = await repo.updateStatus(1, { status: "IN_REVIEW" });
      expect(result.currentState).toBe("IN_REVIEW");
      expect(mockHttpRequest).toHaveBeenCalledWith(
        "/api/candidates/1/status",
        {
          method: "PATCH",
          body: { status: "IN_REVIEW" },
          baseUrl: "http://localhost:8084", authScope: "candidates",
        },
      );
    });
  });

  describe("listStatusHistory", () => {
    it("returns status history array", async () => {
      const history = [
        { id: 1, newState: "NEW", changedAt: "2026-01-01T00:00:00Z" },
      ];
      mockHttpRequest.mockResolvedValue(history);

      const result = await repo.listStatusHistory(1);
      expect(result).toEqual(history);
    });
  });

  describe("deactivate", () => {
    it("sends DELETE and resolves for 204", async () => {
      mockHttpRequest.mockResolvedValue(undefined);

      await expect(repo.deactivate(1)).resolves.toBeUndefined();
      expect(mockHttpRequest).toHaveBeenCalledWith("/api/candidates/1", {
        method: "DELETE",
        baseUrl: "http://localhost:8084", authScope: "candidates",
      });
    });

    it("throws CandidateApiError when request fails", async () => {
      mockHttpRequest.mockRejectedValue(
        new HttpError(404, "Not found", {
          code: "CANDIDATE_NOT_FOUND",
          message: "Candidate not found",
        }),
      );

      await expect(repo.deactivate(999)).rejects.toMatchObject({
        name: "CandidateApiError",
        status: 404,
        code: "CANDIDATE_NOT_FOUND",
      });
    });
  });
});
