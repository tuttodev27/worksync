/**
 * Catalog API Repository.
 * Consume los catalogos de ats-postulant para poblar selects del formulario.
 */

import { httpRequest } from "../../../shared/services/httpClient";
import { API_CANDIDATE_URL } from "../../../shared/constants/forms";
import type {
  CountryCode,
  EducationLevel,
  ExperienceRange,
  Language,
  LanguageLevel,
  RecruiterCatalogs,
} from "../domain/types";

async function safeGet<T>(path: string, fallback: T, baseUrl: string): Promise<T> {
  try {
    const data = await httpRequest<T>(path, { method: "GET", baseUrl, authScope: "candidates" });
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export class CatalogApiRepository {
  private baseUrl: string;

  constructor(baseUrl: string = API_CANDIDATE_URL) {
    this.baseUrl = baseUrl;
  }

  async loadAll(): Promise<RecruiterCatalogs> {
    const [countryCodes, educationLevels, experienceRanges, languages, languageLevels] =
      await Promise.all([
        safeGet<CountryCode[]>("/api/country-codes", [], this.baseUrl),
        safeGet<EducationLevel[]>("/api/education-levels", [], this.baseUrl),
        safeGet<ExperienceRange[]>("/api/experience-ranges", [], this.baseUrl),
        safeGet<Language[]>("/api/languages", [], this.baseUrl),
        safeGet<LanguageLevel[]>("/api/language-levels", [], this.baseUrl),
      ]);

    return {
      countryCodes,
      educationLevels,
      experienceRanges,
      languages,
      languageLevels,
    };
  }
}

export const catalogRepository = new CatalogApiRepository();
