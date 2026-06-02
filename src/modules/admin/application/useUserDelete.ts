/**
 * Hook para eliminar (borrado lógico) un usuario
 */

import { useCallback, useState } from "react";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";

interface UseUserDeleteReturn {
  deleteUser: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useUserDelete(
  repository: UserRepository = userRepository
): UseUserDeleteReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deleteUser = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.delete(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar el usuario"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deleteUser, loading, error };
}
