import { useCallback, useEffect, useState } from "react";
import type { Role } from "../domain/models/Role";
import type { RoleRepository } from "../domain/ports/RoleRepository";
import { roleRepository } from "../infrastructure/RoleApiRepository";

interface UseRoleListReturn {
  roles: Role[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
}

export function useRoleList(
  repository: RoleRepository = roleRepository
): UseRoleListReturn {
  const [roles, setRoles] = useState<Role[]>([]);
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
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar roles");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    roles,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: load,
  };
}
