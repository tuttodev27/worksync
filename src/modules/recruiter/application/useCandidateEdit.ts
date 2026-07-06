import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  candidateRepository,
  CandidateApiError,
} from "../infrastructure/CandidateApiRepository";
import { useCatalogs } from "./useCatalogs";
import type {
  RecruiterCatalogs,
  UpdateCandidatePayload,
  CreateCandidateProfessionalProfile,
  CreateCandidateLanguage,
  CreateCandidateEducation,
  CreateCandidateHardSkill,
  CreateCandidateSoftSkill,
} from "../domain/types";

export interface CandidateEditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identityDocument: string;
  countryCode: string;
  latestPosition: string;
  yearsExperience: string;
  headline: string;
  summary: string;
  educationLevel: string;
  degree: string;
  institution: string;
  language: string;
  languageLevel: string;
  technicalSkills: string;
  softSkills: string;
}

interface UseCandidateEditReturn {
  form: CandidateEditFormData;
  initialForm: CandidateEditFormData;
  error: string;
  loading: boolean;
  saving: boolean;
  notFound: boolean;
  hasChanges: boolean;
  catalogs: RecruiterCatalogs;
  catalogsLoading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findExperienceRange(catalogs: RecruiterCatalogs | undefined, value: string) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.experienceRanges.find((r) => normalize(r.label) === target);
}

function findEducationLevel(catalogs: RecruiterCatalogs | undefined, value: string) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.educationLevels.find((e) => normalize(e.name) === target);
}

function findLanguage(catalogs: RecruiterCatalogs | undefined, value: string) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.languages.find((l) => normalize(l.name) === target) ??
    catalogs.languages.find((l) => normalize(l.isoCode) === target);
}

function findLanguageLevel(catalogs: RecruiterCatalogs | undefined, value: string) {
  if (!catalogs || !value) return undefined;
  const target = normalize(value);
  return catalogs.languageLevels.find((l) => normalize(l.code) === target) ??
    catalogs.languageLevels.find((l) => normalize(l.name) === target);
}

function findCountryCodeIso(catalogs: RecruiterCatalogs | undefined, phoneCode: string) {
  if (!catalogs || !phoneCode) return undefined;
  const target = phoneCode.trim();
  const match = catalogs.countryCodes.find(
    (c) => c.phoneCode === target || c.phoneCode === `+${target.replace(/^\+/, "")}`,
  );
  return match?.isoCode;
}

function describeError(err: unknown): string {
  if (err instanceof CandidateApiError) {
    if (err.status === 400) return err.message || "Los datos enviados no son validos.";
    if (err.status === 401) return "Tu sesion expiro. Inicia sesion nuevamente.";
    if (err.status === 403) return "No tienes permiso para editar candidatos.";
    if (err.status === 404) return "Candidato no encontrado.";
    return err.message || "No se pudo actualizar el candidato.";
  }
  return err instanceof Error ? err.message : "No se pudo actualizar el candidato.";
}

export function useCandidateEdit(): UseCandidateEditReturn {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { catalogs, isLoading: catalogsLoading } = useCatalogs();

  const emptyForm: CandidateEditFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    identityDocument: "",
    countryCode: "",
    latestPosition: "",
    yearsExperience: "",
    headline: "",
    summary: "",
    educationLevel: "",
    degree: "",
    institution: "",
    language: "",
    languageLevel: "",
    technicalSkills: "",
    softSkills: "",
  };

  const [form, setForm] = useState<CandidateEditFormData>(emptyForm);
  const [initialForm, setInitialForm] = useState<CandidateEditFormData>(emptyForm);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  const hasChanges = useMemo(() => {
    return Object.keys(emptyForm).some(
      (key) => form[key as keyof CandidateEditFormData] !== initialForm[key as keyof CandidateEditFormData],
    );
  }, [form, initialForm]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    candidateRepository
      .getById(Number(id))
      .then((candidate) => {
        if (cancelled) return;

        const langId = candidate.languages?.[0]?.languageId;
        const langLevelId = candidate.languages?.[0]?.languageLevelId;
        const matchedLang = catalogs && langId != null
          ? catalogs.languages.find((l) => l.id === langId)
          : undefined;
        const matchedLevel = catalogs && langLevelId != null
          ? catalogs.languageLevels.find((l) => l.id === langLevelId)
          : undefined;

        const loadedForm: CandidateEditFormData = {
          firstName: candidate.firstName ?? "",
          lastName: candidate.lastName ?? "",
          email: candidate.email ?? "",
          phone: candidate.phone ?? "",
          identityDocument: candidate.identityDocument ?? "",
          countryCode: candidate.countryCode ?? "",
          latestPosition: candidate.professionalProfile?.latestPosition ?? "",
          yearsExperience: candidate.professionalProfile?.yearsExperience != null
            ? String(candidate.professionalProfile.yearsExperience)
            : "",
          headline: candidate.professionalProfile?.headline ?? "",
          summary: candidate.professionalProfile?.summary ?? "",
          educationLevel: candidate.educations?.[0]?.educationLevelId
            ? String(candidate.educations[0].educationLevelId)
            : "",
          degree: candidate.educations?.[0]?.degree ?? "",
          institution: candidate.educations?.[0]?.institution ?? "",
          language: matchedLang?.name ?? "",
          languageLevel: matchedLevel?.code ?? "",
          technicalSkills: "",
          softSkills: "",
        };
        setForm(loadedForm);
        setInitialForm(loadedForm);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof CandidateApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar candidato");
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, catalogs]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleCancel = useCallback(() => {
    if (id) {
      navigate(`/recruiter/candidates/${id}`);
    } else {
      navigate("/recruiter/candidates");
    }
  }, [navigate, id]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!id) return;

      setError("");

      if (!form.firstName.trim()) { setError("El nombre es obligatorio."); return; }
      if (!form.lastName.trim()) { setError("El apellido es obligatorio."); return; }
      if (!form.email.trim()) { setError("El email es obligatorio."); return; }

      const professionalProfile: CreateCandidateProfessionalProfile = {};
      if (form.latestPosition.trim()) professionalProfile.latestPosition = form.latestPosition.trim();
      if (form.headline.trim()) professionalProfile.headline = form.headline.trim();
      if (form.summary.trim()) professionalProfile.summary = form.summary.trim();

      const experienceRange = findExperienceRange(catalogs, form.yearsExperience);
      if (experienceRange) {
        professionalProfile.experienceRangeId = experienceRange.id;
        if (experienceRange.minYears != null) {
          professionalProfile.yearsExperience = experienceRange.minYears;
        }
      }

      const educations: CreateCandidateEducation[] = [];
      if (form.educationLevel) {
        educations.push({
          educationLevelId: Number(form.educationLevel),
          degree: form.degree.trim() || undefined,
          institution: form.institution.trim() || undefined,
        });
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

      const payload: UpdateCandidatePayload = {
        phone: form.phone.trim() || undefined,
        identityDocument: form.identityDocument.trim() || undefined,
        countryCode: findCountryCodeIso(catalogs, form.countryCode),
      };

      if (professionalProfile.latestPosition || professionalProfile.experienceRangeId || professionalProfile.headline || professionalProfile.summary) {
        payload.professionalProfile = professionalProfile;
      }
      if (educations.length > 0) payload.educations = educations;
      if (languages.length > 0) payload.languages = languages;

      setSaving(true);
      try {
        await candidateRepository.update(Number(id), payload);
        navigate(`/recruiter/candidates/${id}`);
      } catch (err) {
        setError(describeError(err));
      } finally {
        setSaving(false);
      }
    },
    [id, form, catalogs, navigate],
  );

  return {
    form,
    initialForm,
    error,
    loading,
    saving,
    notFound,
    hasChanges,
    catalogs,
    catalogsLoading,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
