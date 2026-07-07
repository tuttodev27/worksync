/**
 * Hook para desactivar (borrado lógico) un usuario
 */

import { useCallback, useState } from "react";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";

interface UseUserDeactivateReturn {
  deactivateUser: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useUserDeactivate(
  repository: UserRepository = userRepository
): UseUserDeactivateReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deactivateUser = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.deactivate(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo desactivar el usuario"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deactivateUser, loading, error };
}
