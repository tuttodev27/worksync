import { useCallback, useState } from "react";
import type { PermissionRepository } from "../domain/ports/PermissionRepository";
import { permissionRepository } from "../infrastructure/PermissionApiRepository";

interface UsePermissionDeleteReturn {
  deletePermission: (id: number) => Promise<void>;
  loading: boolean;
  error: string;
}

export function usePermissionDelete(
  repository: PermissionRepository = permissionRepository
): UsePermissionDeleteReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const deletePermission = useCallback(
    async (id: number) => {
      setLoading(true);
      setError("");
      try {
        await repository.delete(id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo eliminar el permiso"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repository]
  );

  return { deletePermission, loading, error };
}
