/**
 * Hook para candidato - Application Layer
 * SRP: Este hook SOLO maneja la lógica de creación de candidato contra la API.
 */

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { CandidatoFormData } from "../../../shared/types/forms";
import {
  candidateRepository,
  CandidateApiError,
} from "../infrastructure/CandidateApiRepository";
import type { RecruiterCatalogs } from "../domain/types";
import type {
  CreateCandidatePayload,
  CreateCandidateProfessionalProfile,
  CreateCandidateLanguage,
  CreateCandidateEducation,
} from "../domain/types";

export interface UseCandidateOptions {
  catalogs?: RecruiterCatalogs;
}

export interface UseCandidateReturn {
  form: CandidatoFormData;
  error: string;
  loading: boolean;
  setFormData: (values: Partial<CandidatoFormData>) => void;
  setErrorMessage: (message: string) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

const initialForm: CandidatoFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  linkedin: "",
  experience: "",
  education: "",
  skills: "",
  status: "new",
  notes: "",
  technicalSkills: "",
  softSkills: "",
  language: "",
  languageLevel: "",
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findExperienceRange(
  catalogs: RecruiterCatalogs | undefined,
  value: string,
) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.experienceRanges.find(
    (r) => normalize(r.label) === target,
  );
}

function findEducationLevel(
  catalogs: RecruiterCatalogs | undefined,
  value: string,
) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.educationLevels.find(
    (e) => normalize(e.name) === target,
  );
}

function findLanguage(
  catalogs: RecruiterCatalogs | undefined,
  value: string,
) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return (
    catalogs.languages.find((l) => normalize(l.name) === target) ??
    catalogs.languages.find((l) => normalize(l.isoCode) === target)
  );
}

function findLanguageLevel(
  catalogs: RecruiterCatalogs | undefined,
  value: string,
) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return (
    catalogs.languageLevels.find((l) => normalize(l.code) === target) ??
    catalogs.languageLevels.find((l) => normalize(l.name) === target)
  );
}

function findCountryCodeIso(
  catalogs: RecruiterCatalogs | undefined,
  phoneCode: string,
) {
  if (!catalogs || !phoneCode) return undefined;
  const target = phoneCode.trim();
  const match = catalogs.countryCodes.find(
    (c) => c.phoneCode === target || c.phoneCode === `+${target.replace(/^\+/, "")}`,
  );
  return match?.isoCode;
}

function buildPayload(
  form: CandidatoFormData,
  catalogs: RecruiterCatalogs | undefined,
): CreateCandidatePayload {
  const professionalProfile: CreateCandidateProfessionalProfile = {
    latestPosition: form.education?.trim() || undefined,
  };

  const experienceRange = findExperienceRange(catalogs, form.skills);
  if (experienceRange) {
    professionalProfile.experienceRangeId = experienceRange.id;
    if (experienceRange.minYears !== null) {
      professionalProfile.yearsExperience = experienceRange.minYears;
    }
  }

  const educations: CreateCandidateEducation[] = [];
  const educationLevel = findEducationLevel(catalogs, form.status);
  if (educationLevel) {
    educations.push({ educationLevelId: educationLevel.id });
  }

  const languages: CreateCandidateLanguage[] = [];
  const language = findLanguage(catalogs, form.language);
  const languageLevel = findLanguageLevel(catalogs, form.languageLevel);
  if (language) {
    languages.push({
      languageId: language.id,
      languageLevelId: languageLevel?.id,
    });
  }

  const payload: CreateCandidatePayload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || undefined,
    identityDocument: form.experience?.trim() || undefined,
    countryCode: findCountryCodeIso(catalogs, form.notes ?? ""),
  };

  if (
    professionalProfile.latestPosition ||
    professionalProfile.experienceRangeId ||
    professionalProfile.yearsExperience !== undefined
  ) {
    payload.professionalProfile = professionalProfile;
  }
  if (educations.length > 0) payload.educations = educations;
  if (languages.length > 0) payload.languages = languages;

  return payload;
}

function describeError(err: unknown): string {
  if (err instanceof CandidateApiError) {
    if (err.status === 409) {
      return "Ya existe un postulante con ese correo electronico.";
    }
    if (err.status === 400) {
      return err.message || "Los datos enviados no son validos.";
    }
    if (err.status === 401) {
      return "Tu sesion expiro. Inicia sesion nuevamente.";
    }
    if (err.status === 403) {
      return "No tienes permiso para crear postulantes.";
    }
    return err.message || "No se pudo crear el candidato.";
  }
  return err instanceof Error
    ? err.message
    : "No se pudo crear el candidato. Intenta de nuevo.";
}

export function useCandidate(options: UseCandidateOptions = {}): UseCandidateReturn {
  const { catalogs } = options;
  const navigate = useNavigate();

  const [form, setForm] = useState<CandidatoFormData>(initialForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const setFormData = useCallback((values: Partial<CandidatoFormData>) => {
    setForm((prev) => ({ ...prev, ...values }));
  }, []);

  const setErrorMessage = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/recluiter/candidates");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (!form.firstName.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }
      if (!form.lastName.trim()) {
        setError("El apellido es obligatorio.");
        return;
      }
      if (!form.email.trim()) {
        setError("El email es obligatorio.");
        return;
      }

      const payload = buildPayload(form, catalogs);

      setLoading(true);
      try {
        await candidateRepository.create(payload);
        navigate("/recluiter/candidates");
      } catch (err) {
        setError(describeError(err));
      } finally {
        setLoading(false);
      }
    },
    [form, catalogs, navigate],
  );

  return {
    form,
    error,
    loading,
    setFormData,
    setErrorMessage,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
