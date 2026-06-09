/**
 * useCatalogs - carga catalogos desde la API para alimentar el form de candidato.
 */

import { useEffect, useState, useCallback } from "react";
import { catalogRepository } from "../infrastructure/CatalogApiRepository";
import type { RecruiterCatalogs } from "../domain/types";

const EMPTY: RecruiterCatalogs = {
  countryCodes: [],
  educationLevels: [],
  experienceRanges: [],
  languages: [],
  languageLevels: [],
};

export interface UseCatalogsReturn {
  catalogs: RecruiterCatalogs;
  isLoading: boolean;
  error: string;
  refresh: () => void;
}

export function useCatalogs(): UseCatalogsReturn {
  const [catalogs, setCatalogs] = useState<RecruiterCatalogs>(EMPTY);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await catalogRepository.loadAll();
      setCatalogs(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los catalogos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { catalogs, isLoading, error, refresh: load };
}
