/**
 * Hook para desactivar (borrado lógico) un postulante
 */

import { useCallback, useState } from "react";
import { candidateRepository } from "../infrastructure/CandidateApiRepository";
import type { CandidateApiRepository } from "../infrastructure/CandidateApiRepository";

interface UseCandidateDeactivateReturn {
  deactivateCandidate: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useCandidateDeactivate(
  repository: Pick<CandidateApiRepository, "deactivate"> = candidateRepository
): UseCandidateDeactivateReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deactivateCandidate = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.deactivate(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo desactivar el postulante"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deactivateCandidate, loading, error };
}
