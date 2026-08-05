/**
 * useCandidateStatuses - carga el catalogo de estados de postulante desde la API.
 */

import { useEffect, useState, useCallback } from "react";
import { candidateRepository } from "../infrastructure/CandidateApiRepository";
import type { CandidateStatusResponse } from "../domain/types";

export interface UseCandidateStatusesReturn {
  statuses: CandidateStatusResponse[];
  statusLabel: (code?: string) => string;
  isLoading: boolean;
  error: string;
  refresh: () => void;
}

export function useCandidateStatuses(): UseCandidateStatusesReturn {
  const [statuses, setStatuses] = useState<CandidateStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await candidateRepository.listStatuses();
      setStatuses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los estados.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusLabel = useCallback(
    (code?: string) => {
      if (!code) return "-";
      const found = statuses.find((s) => s.code === code);
      return found?.label ?? code;
    },
    [statuses],
  );

  return { statuses, statusLabel, isLoading, error, refresh: load };
}
