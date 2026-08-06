// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCandidate } from "../useCandidate";
import type { RecruiterCatalogs } from "../../domain/types";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../infrastructure/CandidateApiRepository", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../infrastructure/CandidateApiRepository")
    >();
  return {
    ...actual,
    candidateRepository: {
      ...actual.candidateRepository,
      create: vi.fn(),
    },
  };
});

import {
  candidateRepository,
  CandidateApiError,
} from "../../infrastructure/CandidateApiRepository";

const mockedCreate = vi.mocked(candidateRepository.create);

const catalogs: RecruiterCatalogs = {
  countryCodes: [{ id: 56, countryName: "Chile", isoCode: "CL", phoneCode: "+56" }],
  educationLevels: [{ id: 3, name: "Ingeniería" }],
  experienceRanges: [{ id: 5, label: "5-8 años", minYears: 5, maxYears: 8 }],
  languages: [{ id: 1, name: "Español", isoCode: "es" }],
  languageLevels: [{ id: 2, code: "B2", name: "Intermedio" }],
};

function submit(
  result: { current: ReturnType<typeof useCandidate> },
) {
  return act(async () => {
    await result.current.handleSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent);
  });
}

describe("useCandidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty form, no error and not loading", () => {
    const { result } = renderHook(() => useCandidate({ catalogs }));

    expect(result.current.form).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      linkedin: "",
      identityDocument: "",
      latestPosition: "",
      yearsExperience: "",
      educationLevel: "new",
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      countryCode: "",
      headline: "",
      summary: "",
      technicalSkills: "",
      softSkills: "",
      language: "",
      languageLevel: "",
    });
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("updates the form on handleChange using renamed fields", () => {
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.handleChange({
        target: { name: "yearsExperience", value: "5-8 años" },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.form.yearsExperience).toBe("5-8 años");
  });

  it("builds a payload with the full professional profile", async () => {
    mockedCreate.mockResolvedValue({ id: 1 } as never);
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.setFormData({
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@example.com",
        phone: "+56912345678",
        identityDocument: "11111111-1",
        countryCode: "+56",
        headline: "Backend Engineer",
        summary: "Resumen de carrera",
        latestPosition: "Senior Backend Developer",
        yearsExperience: "5-8 años",
        educationLevel: "Ingeniería",
        degree: "Ingeniería Civil Informática",
        institution: "Universidad de Chile",
        startDate: "2015-03-01",
        endDate: "2020-12-31",
      });
    });

    await submit(result);

    expect(mockedCreate).toHaveBeenCalledWith({
      firstName: "Juan",
      lastName: "Perez",
      email: "juan@example.com",
      phone: "+56912345678",
      identityDocument: "11111111-1",
      countryCode: "CL",
      professionalProfile: {
        headline: "Backend Engineer",
        summary: "Resumen de carrera",
        latestPosition: "Senior Backend Developer",
        experienceRangeId: 5,
        yearsExperience: 5,
      },
      educations: [{
        educationLevelId: 3,
        degree: "Ingeniería Civil Informática",
        institution: "Universidad de Chile",
        startDate: "2015-03-01",
        endDate: "2020-12-31",
      }],
    });
    expect(mockNavigate).toHaveBeenCalledWith("/recruiter/candidates");
  });

  it("resolves experienceRangeId and yearsExperience from the catalog label", async () => {
    mockedCreate.mockResolvedValue({ id: 1 } as never);
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.setFormData({
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@example.com",
        yearsExperience: "5-8 años",
      });
    });

    await submit(result);

    expect(mockedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        professionalProfile: {
          experienceRangeId: 5,
          yearsExperience: 5,
        },
      }),
    );
  });

  it("omits professionalProfile when the whole profile is empty", async () => {
    mockedCreate.mockResolvedValue({ id: 1 } as never);
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.setFormData({
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@example.com",
      });
    });

    await submit(result);

    const payload = mockedCreate.mock.calls[0][0];
    expect(payload).toEqual({
      firstName: "Juan",
      lastName: "Perez",
      email: "juan@example.com",
    });
    expect(payload.professionalProfile).toBeUndefined();
  });

  it("omits professionalProfile when the range label has no catalog match", async () => {
    mockedCreate.mockResolvedValue({ id: 1 } as never);
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.setFormData({
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@example.com",
        latestPosition: "Dev",
        yearsExperience: "100+ años",
      });
    });

    await submit(result);

    expect(mockedCreate).toHaveBeenCalledWith({
      firstName: "Juan",
      lastName: "Perez",
      email: "juan@example.com",
      professionalProfile: {
        latestPosition: "Dev",
      },
    });
  });

  it("shows the API message on a 400 catalog reference error", async () => {
    mockedCreate.mockRejectedValue(
      new CandidateApiError(
        400,
        "No existe un rango de experiencia activo para experienceRangeId: 99",
        "INVALID_CATALOG_REFERENCE",
      ),
    );
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.setFormData({
        firstName: "Juan",
        lastName: "Perez",
        email: "juan@example.com",
      });
    });

    await submit(result);

    await waitFor(() => {
      expect(result.current.error).toBe(
        "No existe un rango de experiencia activo para experienceRangeId: 99",
      );
    });
    expect(result.current.loading).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("validates required fields before calling the API", async () => {
    const { result } = renderHook(() => useCandidate({ catalogs }));

    await submit(result);

    expect(mockedCreate).not.toHaveBeenCalled();
    expect(result.current.error).toBe("El nombre es obligatorio.");
  });

  it("navigates back on cancel", () => {
    const { result } = renderHook(() => useCandidate({ catalogs }));

    act(() => {
      result.current.handleCancel();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/recruiter/candidates");
  });
});
