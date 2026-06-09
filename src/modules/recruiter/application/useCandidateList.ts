/**
 * Hook para listar candidatos - Application Layer
 * SRP: Solo lee y expone el listado de candidatos persistidos.
 */

import { useEffect, useState, useCallback } from "react";
import type { Candidate } from "../../../shared/types/forms";
import { STORAGE_KEYS } from "../../../shared/constants/forms";

function readCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.candidates);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Candidate[]) : [];
  } catch {
    return [];
  }
}

export interface UseCandidateListReturn {
  candidates: Candidate[];
  isLoading: boolean;
  refresh: () => void;
  getById: (id: string) => Candidate | undefined;
}

export function useCandidateList(): UseCandidateListReturn {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(() => {
    setCandidates(readCandidates());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoading(false);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.candidates) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const getById = useCallback(
    (id: string) => candidates.find((c) => c.id === id),
    [candidates],
  );

  return { candidates, isLoading, refresh, getById };
}
