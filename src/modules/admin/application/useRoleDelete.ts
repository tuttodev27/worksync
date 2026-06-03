import { useCallback, useState } from "react";
import type { RoleRepository } from "../domain/ports/RoleRepository";
import { roleRepository } from "../infrastructure/RoleApiRepository";

interface UseRoleDeleteReturn {
  deleteRole: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function useRoleDelete(
  repository: RoleRepository = roleRepository
): UseRoleDeleteReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deleteRole = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.delete(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar el rol"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deleteRole, loading, error };
}
