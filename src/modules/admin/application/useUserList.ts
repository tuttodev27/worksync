/**
 * Hook para listar usuarios
 * SRP: Solo maneja la lógica de obtener la lista de usuarios
 */

import { useCallback, useEffect, useState } from "react";
import type { User } from "../domain/models/User";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";

interface UseUserListReturn {
  users: User[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
}

export function useUserList(
  repository: UserRepository = userRepository
): UseUserListReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await repository.list(activeFilter);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    users,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    refresh: load,
  };
}
