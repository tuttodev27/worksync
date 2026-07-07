/**
 * Hook para listar usuarios con paginación
 * SRP: Maneja la lógica de obtener la lista paginada de usuarios
 */

import { useCallback, useEffect, useState } from "react";
import type { User } from "../domain/models/User";
import { userRepository } from "../infrastructure/UserApiRepository";
import type { UserRepository } from "../domain/ports/UserRepository";

const DEFAULT_SIZE = 10;

interface UseUserListReturn {
  users: User[];
  loading: boolean;
  error: string;
  activeFilter?: boolean;
  setActiveFilter: (value: boolean | undefined) => void;
  refresh: () => Promise<void>;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

export function useUserList(
  repository: UserRepository = userRepository,
  pageSize: number = DEFAULT_SIZE,
): UseUserListReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await repository.list(activeFilter, page, pageSize);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [repository, activeFilter, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetActiveFilter = useCallback((value: boolean | undefined) => {
    setActiveFilter(value);
    setPage(0);
  }, []);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    users,
    loading,
    error,
    activeFilter,
    setActiveFilter: handleSetActiveFilter,
    refresh: load,
    page,
    totalPages,
    setPage: handleSetPage,
  };
}
