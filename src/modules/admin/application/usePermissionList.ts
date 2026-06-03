import { useCallback, useEffect, useState } from "react";
import type { Permission } from "../domain/models/Permission";
import type { PermissionRepository } from "../domain/ports/PermissionRepository";
import { permissionRepository } from "../infrastructure/PermissionApiRepository";

interface UsePermissionListReturn {
  permissions: Permission[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
}

export function usePermissionList(
  repository: PermissionRepository = permissionRepository
): UsePermissionListReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await repository.list(activeFilter);
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar permisos");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    permissions,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: load,
  };
}
